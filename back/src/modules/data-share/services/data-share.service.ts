import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, MoreThan, Repository } from 'typeorm';
import { DataShare } from '../../../entities/data-share.entity';
import { User } from '../../../entities/user.entity';
import {
  DifficultyLevel,
  MasteryLevel,
  Vocabulary,
} from '../../../entities/vocabulary.entity';
import {
  PracticeHistory,
  PracticeType,
} from '../../../entities/practice-history.entity';
import { UserRepository } from '../../auth/repositories/user.repository';
import { VocabularyWebSocketGateway } from '../../websocket/websocket.gateway';
import { DataShareMailService } from './data-share-mail.service';

export const SHARE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_SHARED_VOCABULARIES = 5000;
export const MAX_SHARED_HISTORIES = 20000;
export const MAX_PENDING_SENT = 20;

export interface SharedVocabulary {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  note: string;
  image: string | null;
  video: string | null;
  audio: string | null;
  difficulty: string;
  masteryLevel: string;
  correctCount: number;
  incorrectCount: number;
  tags: string[] | null;
  isFavorite: boolean;
  createdAt: string;
}

export interface SharedHistory {
  word: string;
  practiceType: string;
  isCorrect: boolean;
  userAnswer: string | null;
  score: number;
  timeSpent: number;
  createdAt: string;
}

export interface SharePayload {
  vocabularies: SharedVocabulary[];
  histories: SharedHistory[];
}

export interface ShareMergeStats {
  newVocabularies: number;
  skippedVocabularies: number;
  newHistories: number;
}

const DIFFICULTIES = new Set<string>(Object.values(DifficultyLevel));
const MASTERIES = new Set<string>(Object.values(MasteryLevel));
const PRACTICE_TYPES = new Set<string>(Object.values(PracticeType));

const toCount = (value: unknown): number => {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const toDate = (value: unknown): Date => {
  const d = value ? new Date(value as string) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const toMedia = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 && value.length <= 2048
    ? value
    : null;

const historyKey = (
  vocabularyId: string,
  practiceType: string,
  score: number,
  timeSpent: number,
) => `${vocabularyId}|${practiceType}|${score}|${timeSpent}`;

@Injectable()
export class DataShareService {
  constructor(
    @InjectRepository(DataShare)
    private readonly shares: Repository<DataShare>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Vocabulary)
    private readonly vocabularies: Repository<Vocabulary>,
    @InjectRepository(PracticeHistory)
    private readonly histories: Repository<PracticeHistory>,
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
  private async buildPayload(senderId: string): Promise<SharePayload> {
    const vocabularies = await this.vocabularies.find({
      where: { userId: senderId },
      order: { createdAt: 'ASC' },
      take: MAX_SHARED_VOCABULARIES + 1,
    });
    if (vocabularies.length === 0) {
      throw new BadRequestException('NO_DATA_TO_SHARE');
    }
    if (vocabularies.length > MAX_SHARED_VOCABULARIES) {
      throw new BadRequestException('TOO_MUCH_DATA');
    }

    const wordById = new Map(vocabularies.map((v) => [v.id, v.word]));
    const histories = await this.histories.find({
      where: { userId: senderId },
      order: { createdAt: 'DESC' },
      take: MAX_SHARED_HISTORIES,
    });

    return {
      vocabularies: vocabularies.map((v) => ({
        word: v.word,
        pronunciation: v.pronunciation || '',
        meaning: v.meaning || '',
        example: v.example || '',
        exampleTranslation: v.exampleTranslation || '',
        note: v.note || '',
        image: toMedia(v.image),
        video: toMedia(v.video),
        audio: toMedia(v.audio),
        difficulty: v.difficulty,
        masteryLevel: v.masteryLevel,
        correctCount: v.correctCount,
        incorrectCount: v.incorrectCount,
        tags: v.tags && v.tags.length > 0 ? v.tags : null,
        isFavorite: !!v.isFavorite,
        createdAt: new Date(v.createdAt).toISOString(),
      })),
      histories: histories
        .filter((h) => wordById.has(h.vocabularyId))
        .map((h) => ({
          word: wordById.get(h.vocabularyId) as string,
          practiceType: h.practiceType,
          isCorrect: !!h.isCorrect,
          userAnswer: h.userAnswer ?? null,
          score: h.score,
          timeSpent: h.timeSpent,
          createdAt: new Date(h.createdAt).toISOString(),
        })),
    };
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
    const saved = await this.shares.save(
      this.shares.create({
        senderId,
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        status: 'pending',
        payload: JSON.stringify(payload),
        vocabularyCount: payload.vocabularies.length,
        historyCount: payload.histories.length,
      }),
    );

    this.gateway.emitToUser(recipient.id, 'data-share:received', {
      id: saved.id,
      sender: { id: sender.id, fullName: sender.fullName, email: sender.email },
      vocabularyCount: saved.vocabularyCount,
      historyCount: saved.historyCount,
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

      let payload: SharePayload;
      try {
        payload = JSON.parse(share.payload) as SharePayload;
      } catch {
        throw new BadRequestException('SHARE_CORRUPTED');
      }
      const merged = await this.mergePayload(manager, userId, payload);
      await manager
        .getRepository(DataShare)
        .update({ id }, { resultStats: JSON.stringify(merged) });
      return merged;
    });

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

    this.gateway.emitToUser(share.recipientId, 'data-share:cancelled', { id });
    return { id, status: 'cancelled' as const };
  }

  /**
   * Add the shared words to the recipient. Words the recipient already has are
   * left untouched. Histories are only attached to words added by this share,
   * so nobody else's practice results get mixed into words the recipient had.
   */
  private async mergePayload(
    manager: EntityManager,
    userId: string,
    payload: SharePayload,
  ): Promise<ShareMergeStats> {
    const vocabRepo = manager.getRepository(Vocabulary);
    const historyRepo = manager.getRepository(PracticeHistory);

    const existing = await vocabRepo.find({
      where: { userId },
      select: { id: true, word: true },
    });
    const knownWords = new Set(existing.map((v) => v.word));

    const toCreate: Vocabulary[] = [];
    let skipped = 0;
    for (const shared of payload.vocabularies ?? []) {
      const word = typeof shared?.word === 'string' ? shared.word.trim() : '';
      if (!word) continue;
      if (knownWords.has(word)) {
        skipped++;
        continue;
      }
      knownWords.add(word);
      toCreate.push(
        vocabRepo.create({
          userId,
          word,
          pronunciation: String(shared.pronunciation ?? ''),
          meaning: String(shared.meaning ?? ''),
          example: String(shared.example ?? ''),
          exampleTranslation: String(shared.exampleTranslation ?? ''),
          note: String(shared.note ?? ''),
          image: toMedia(shared.image) as string,
          video: toMedia(shared.video) as string,
          audio: toMedia(shared.audio) as string,
          difficulty: (DIFFICULTIES.has(shared.difficulty)
            ? shared.difficulty
            : DifficultyLevel.EASY) as DifficultyLevel,
          masteryLevel: (MASTERIES.has(shared.masteryLevel)
            ? shared.masteryLevel
            : MasteryLevel.NEW) as MasteryLevel,
          correctCount: toCount(shared.correctCount),
          incorrectCount: toCount(shared.incorrectCount),
          tags: Array.isArray(shared.tags)
            ? shared.tags.map((t) => String(t).trim()).filter(Boolean)
            : [],
          isFavorite: !!shared.isFavorite,
          createdAt: toDate(shared.createdAt),
        }),
      );
    }

    if (toCreate.length > 0) {
      await vocabRepo.save(toCreate, { chunk: 200 });
    }
    const idByNewWord = new Map(toCreate.map((v) => [v.word, v.id]));

    const seenKeys = new Set<string>();
    const historyRows: PracticeHistory[] = [];
    for (const shared of payload.histories ?? []) {
      const vocabularyId = idByNewWord.get(shared?.word);
      if (!vocabularyId || !PRACTICE_TYPES.has(shared.practiceType)) continue;
      const score = toCount(shared.score);
      const timeSpent = toCount(shared.timeSpent);
      const key = historyKey(vocabularyId, shared.practiceType, score, timeSpent);
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      historyRows.push(
        historyRepo.create({
          userId,
          vocabularyId,
          practiceType: shared.practiceType as PracticeType,
          isCorrect: !!shared.isCorrect,
          userAnswer: shared.userAnswer == null ? (null as any) : String(shared.userAnswer),
          score,
          timeSpent,
          createdAt: toDate(shared.createdAt),
        }),
      );
    }
    if (historyRows.length > 0) {
      await historyRepo.save(historyRows, { chunk: 500 });
    }

    return {
      newVocabularies: toCreate.length,
      skippedVocabularies: skipped,
      newHistories: historyRows.length,
    };
  }
}
