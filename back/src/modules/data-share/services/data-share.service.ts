import { cleanupUnusedUploads, snapshotUploadCandidates } from '../../../common/services/unused-upload';
import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, MoreThan, Repository } from 'typeorm';
import { DataShare } from '../../../entities/data-share.entity';
import { User } from '../../../entities/user.entity';
import {
  SnapshotSummary,
  UserDataSnapshot,
  buildUserDataSnapshot,
  mergeUserDataSnapshot,
  summarizeSnapshot,
} from '../../../common/user-data/user-data-snapshot';
import { UserRepository } from '../../auth/repositories/user.repository';
import { VocabularyWebSocketGateway } from '../../websocket/websocket.gateway';
import { DataShareMailService } from './data-share-mail.service';

export const SHARE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_SHARED_VOCABULARIES = 5000;
export const MAX_SHARED_HISTORIES = 20000;
export const MAX_SHARED_REVIEWS = 20000;
export const MAX_PENDING_SENT = 20;
/** Embedded base64 media is left out of an offer to keep it small. */
const SHARED_MEDIA_MAX_LENGTH = 2048;

const parseSummary = (value: string | null | undefined): SnapshotSummary | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as SnapshotSummary;
  } catch {
    return null;
  }
};

@Injectable()
export class DataShareService {
  constructor(
    @InjectRepository(DataShare)
    private readonly shares: Repository<DataShare>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly gateway: VocabularyWebSocketGateway,
    private readonly mail: DataShareMailService,
  ) {}

  private cutoff(): Date {
    return new Date(Date.now() - SHARE_EXPIRY_MS);
  }

  private isExpired(share: DataShare): boolean {
    return Date.now() - new Date(share.createdAt).getTime() > SHARE_EXPIRY_MS;
  }

  /** Snapshot of everything the sender would see in the profile export. */
  private async buildPayload(senderId: string): Promise<UserDataSnapshot> {
    const { snapshot, overLimit } = await buildUserDataSnapshot(
      this.dataSource.manager,
      senderId,
      {
        maxVocabularies: MAX_SHARED_VOCABULARIES,
        maxHistories: MAX_SHARED_HISTORIES,
        maxReviews: MAX_SHARED_REVIEWS,
        mediaMaxLength: SHARED_MEDIA_MAX_LENGTH,
        // When capped, keep the most recent practice.
        historyOrder: 'DESC',
      },
    );
    if (overLimit) throw new BadRequestException('TOO_MUCH_DATA');
    if (snapshot.vocabularies.length === 0) {
      throw new BadRequestException('NO_DATA_TO_SHARE');
    }
    return snapshot;
  }

  async create(senderId: string, email: string) {
    const sender = await this.userRepository.findById(senderId);
    if (!sender) throw new UnauthorizedException('User not found');

    const recipient = await this.users
      .createQueryBuilder('u')
      .where('LOWER(u.email) = :email', { email: email.trim().toLowerCase() })
      .getOne();
    if (!recipient || recipient.isActive === false) {
      throw new NotFoundException('EMAIL_NOT_FOUND');
    }
    if (recipient.id === senderId) {
      throw new BadRequestException('CANNOT_SHARE_SELF');
    }

    // Offers nobody answered for a week are dead: retire them so they no longer
    // count against the limits below.
    await this.shares
      .createQueryBuilder()
      .update(DataShare)
      .set({ status: 'cancelled', respondedAt: new Date() })
      .where('senderId = :senderId AND status = :status AND createdAt < :cutoff', {
        senderId,
        status: 'pending',
        cutoff: this.cutoff(),
      })
      .execute();

    const alreadyPending = await this.shares.count({
      where: { senderId, recipientId: recipient.id, status: 'pending' },
    });
    if (alreadyPending > 0) throw new ConflictException('ALREADY_PENDING');

    const pendingTotal = await this.shares.count({
      where: { senderId, status: 'pending' },
    });
    if (pendingTotal >= MAX_PENDING_SENT) {
      throw new BadRequestException('TOO_MANY_PENDING');
    }

    const payload = await this.buildPayload(senderId);
    const summary = summarizeSnapshot(payload);
    const saved = await this.shares.save(
      this.shares.create({
        senderId,
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        status: 'pending',
        payload: JSON.stringify(payload),
        vocabularyCount: payload.vocabularies.length,
        historyCount: payload.histories.length,
        summary: JSON.stringify(summary),
      }),
    );

    this.gateway.emitToUser(recipient.id, 'data-share:received', {
      id: saved.id,
      sender: { id: sender.id, fullName: sender.fullName, email: sender.email },
      vocabularyCount: saved.vocabularyCount,
      historyCount: saved.historyCount,
      summary,
      createdAt: saved.createdAt,
    });

    // Fire and forget: the in-app dialog is what matters.
    void this.mail
      .sendShareNotice({
        to: recipient.email,
        senderName: sender.fullName,
        senderEmail: sender.email,
        vocabularyCount: saved.vocabularyCount,
      })
      .catch(() => undefined);

    return {
      id: saved.id,
      status: saved.status,
      recipientEmail: recipient.email,
      vocabularyCount: saved.vocabularyCount,
      historyCount: saved.historyCount,
      summary,
    };
  }

  async listIncoming(userId: string) {
    const rows = await this.shares.find({
      where: { recipientId: userId, status: 'pending', createdAt: MoreThan(this.cutoff()) },
      select: {
        id: true,
        senderId: true,
        vocabularyCount: true,
        historyCount: true,
        summary: true,
        createdAt: true,
      },
      order: { createdAt: 'ASC' },
    });
    if (rows.length === 0) return [];

    const senders = await this.users.find({
      where: { id: In(Array.from(new Set(rows.map((r) => r.senderId)))) },
      select: { id: true, fullName: true, email: true },
    });
    const senderById = new Map(senders.map((s) => [s.id, s]));

    return rows.map((row) => {
      const sender = senderById.get(row.senderId);
      return {
        id: row.id,
        sender: {
          id: row.senderId,
          fullName: sender?.fullName ?? '',
          email: sender?.email ?? '',
        },
        vocabularyCount: row.vocabularyCount,
        historyCount: row.historyCount,
        // Offers made before this existed have no summary.
        summary: parseSummary(row.summary),
        createdAt: row.createdAt,
      };
    });
  }

  private async loadForRecipient(userId: string, id: string): Promise<DataShare> {
    const share = await this.shares.findOne({ where: { id } });
    // Same answer for "missing" and "not yours" so ids cannot be probed.
    if (!share || share.recipientId !== userId) {
      throw new NotFoundException('SHARE_NOT_FOUND');
    }
    if (share.status !== 'pending') {
      throw new ConflictException('SHARE_ALREADY_HANDLED');
    }
    if (this.isExpired(share)) throw new GoneException('SHARE_EXPIRED');
    return share;
  }

  async accept(userId: string, id: string) {
    const share = await this.loadForRecipient(userId, id);

    const stats = await this.dataSource.transaction(async (manager) => {
      // Claim first. Only one concurrent request can flip pending -> accepted,
      // so a double click can never import the data twice.
      const claim = await manager
        .getRepository(DataShare)
        .update({ id, status: 'pending' }, { status: 'accepted', respondedAt: new Date() });
      if (!claim.affected) throw new ConflictException('SHARE_ALREADY_HANDLED');

      let payload: unknown;
      try {
        payload = JSON.parse(share.payload);
      } catch {
        throw new BadRequestException('SHARE_CORRUPTED');
      }
      // Words, history, categories, tags, topics, tabs and Smart review are
      // added; nothing the recipient already has is changed or removed.
      const merged = await mergeUserDataSnapshot(manager, userId, payload, 'share');
      await manager
        .getRepository(DataShare)
        .update({ id }, { resultStats: JSON.stringify(merged) });
      return merged;
    });

    await cleanupUnusedUploads(this.dataSource.manager, snapshotUploadCandidates(share.payload));
    await this.userRepository.recalculateTotalWords(userId);

    const recipient = await this.userRepository.findById(userId);
    this.gateway.emitToUser(share.senderId, 'data-share:responded', {
      id,
      status: 'accepted',
      recipient: { fullName: recipient?.fullName ?? '', email: recipient?.email ?? share.recipientEmail },
      stats,
    });
    this.gateway.emitVocabularyByDateRefresh(userId);

    return { id, status: 'accepted' as const, stats };
  }

  async reject(userId: string, id: string) {
    const share = await this.loadForRecipient(userId, id);
    const result = await this.shares.update(
      { id, status: 'pending' },
      { status: 'rejected', respondedAt: new Date() },
    );
    if (!result.affected) throw new ConflictException('SHARE_ALREADY_HANDLED');
    await cleanupUnusedUploads(this.dataSource.manager, snapshotUploadCandidates(share.payload));

    const recipient = await this.userRepository.findById(userId);
    this.gateway.emitToUser(share.senderId, 'data-share:responded', {
      id,
      status: 'rejected',
      recipient: { fullName: recipient?.fullName ?? '', email: recipient?.email ?? share.recipientEmail },
    });
    return { id, status: 'rejected' as const };
  }

  async cancel(userId: string, id: string) {
    const share = await this.shares.findOne({ where: { id } });
    if (!share || share.senderId !== userId) {
      throw new NotFoundException('SHARE_NOT_FOUND');
    }
    const result = await this.shares.update(
      { id, status: 'pending' },
      { status: 'cancelled', respondedAt: new Date() },
    );
    if (!result.affected) throw new ConflictException('SHARE_ALREADY_HANDLED');
    await cleanupUnusedUploads(this.dataSource.manager, snapshotUploadCandidates(share.payload));

    this.gateway.emitToUser(share.recipientId, 'data-share:cancelled', { id });
    return { id, status: 'cancelled' as const };
  }
}
