import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { SrsProgress } from '../../entities/srs-progress.entity';
import { SrsReview, SrsRating } from '../../entities/srs-review.entity';
import { calculateSrsSchedule } from './srs-scheduler';

@Injectable()
export class SrsService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly words: Repository<Vocabulary>,
    @InjectRepository(SrsProgress)
    private readonly progress: Repository<SrsProgress>,
    @InjectRepository(SrsReview)
    private readonly reviews: Repository<SrsReview>,
    private readonly dataSource: DataSource,
  ) {}

  async getOverview(userId: string, tabId?: string) {
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const wordsQuery = this.filterTab(
      this.words
        .createQueryBuilder('v')
        .where('v.userId = :userId', { userId }),
      tabId,
    );
    const progressQuery = (alias: string) =>
      this.filterTab(
        this.progress
          .createQueryBuilder(alias)
          .innerJoin(alias + '.vocabulary', 'v', 'v.userId = :userId', {
            userId,
          })
          .where(alias + '.userId = :userId', { userId }),
        tabId,
      );
    const reviewsQuery = this.filterTab(
      this.reviews
        .createQueryBuilder('r')
        .innerJoin('r.vocabulary', 'v', 'v.userId = :userId', { userId })
        .where('r.userId = :userId', { userId }),
      tabId,
    );

    const [totalWords, started, due, mastered, reviewed24h, nextReview] =
      await Promise.all([
        wordsQuery.getCount(),
        progressQuery('p').getCount(),
        progressQuery('p')
          .andWhere('p.nextReviewAt <= :now', { now: this.sqlDate(now) })
          .getCount(),
        progressQuery('p')
          .andWhere('p.intervalDays >= :days', { days: 21 })
          .getCount(),
        reviewsQuery
          .andWhere('r.createdAt >= :since', { since: this.sqlDate(since) })
          .getCount(),
        progressQuery('p')
          .andWhere('p.nextReviewAt > :now', { now: this.sqlDate(now) })
          .orderBy('p.nextReviewAt', 'ASC')
          .getOne(),
      ]);
    const newWords = Math.max(0, totalWords - started);
    return {
      totalWords,
      newWords,
      learningWords: started - mastered,
      masteredWords: mastered,
      dueWords: due,
      availableWords: due + newWords,
      reviewed24h,
      nextReviewAt: nextReview?.nextReviewAt ?? null,
    };
  }

  async getQueue(
    userId: string,
    requestedLimit = 20,
    tabId?: string,
    includeScheduled = false,
  ) {
    const limit = Math.max(1, Math.min(50, Math.trunc(requestedLimit) || 20));
    const now = new Date();
    const dueProgress = await this.filterTab(
      this.progress
        .createQueryBuilder('p')
        .innerJoinAndSelect('p.vocabulary', 'v', 'v.userId = :userId', {
          userId,
        })
        .where('p.userId = :userId', { userId })
        .andWhere('p.nextReviewAt <= :now', { now: this.sqlDate(now) }),
      tabId,
    )
      .orderBy('p.nextReviewAt', 'ASC')
      .take(limit)
      .getMany();

    const due = dueProgress.map((p) => this.formatCard(p.vocabulary, p));
    const remaining = limit - due.length;
    if (!remaining) return due;

    const newWords = await this.filterTab(
      this.words
        .createQueryBuilder('v')
        .where('v.userId = :userId', { userId })
        .andWhere(
          'NOT EXISTS (SELECT 1 FROM srs_progress p WHERE p.vocabularyId = v.id AND p.userId = :userId)',
          { userId },
        ),
      tabId,
    )
      .orderBy('v.createdAt', 'ASC')
      .addOrderBy('v.id', 'ASC')
      .take(remaining)
      .getMany();
    const available = [...due, ...newWords.map((word) => this.formatCard(word, null))];
    const slots = limit - available.length;
    if (!includeScheduled || slots <= 0) return available;

    // Optional self-practice: include cards scheduled for the future without
    // changing their SRS due dates. Only owned vocabulary from the selected tab.
    const scheduled = await this.filterTab(
      this.progress
        .createQueryBuilder('p')
        .innerJoinAndSelect('p.vocabulary', 'v', 'v.userId = :userId', {
          userId,
        })
        .where('p.userId = :userId', { userId })
        .andWhere('p.nextReviewAt > :now', { now: this.sqlDate(now) }),
      tabId,
    )
      .orderBy('p.nextReviewAt', 'ASC')
      .addOrderBy('p.id', 'ASC')
      .take(slots)
      .getMany();
    return [...available, ...scheduled.map((p) => this.formatCard(p.vocabulary, p, true))];
  }

  async submitReview(userId: string, vocabularyId: string, rating: SrsRating) {
    const now = new Date();
    return this.dataSource.transaction(async (manager) => {
      const word = await manager.findOne(Vocabulary, {
        where: { id: vocabularyId, userId },
      });
      if (!word) throw new NotFoundException('Vocabulary not found');

      const previous = await manager.findOne(SrsProgress, {
        where: { userId, vocabularyId },
      });
      if (previous && previous.nextReviewAt > now) {
        throw new ConflictException('This card is not due for review yet');
      }
      const schedule = calculateSrsSchedule(
        {
          repetitions: previous?.repetitions ?? 0,
          lapses: previous?.lapses ?? 0,
          intervalDays: previous?.intervalDays ?? 0,
          easeFactor: previous?.easeFactor ?? 2.5,
        },
        rating,
        now,
      );

      const saved = await manager.save(
        SrsProgress,
        manager.create(SrsProgress, {
          ...(previous ?? {}),
          userId,
          vocabularyId,
          ...schedule,
          lastReviewedAt: now,
        }),
      );
      await manager.save(
        SrsReview,
        manager.create(SrsReview, {
          userId,
          vocabularyId,
          rating,
          previousIntervalDays: previous?.intervalDays ?? 0,
          intervalDays: schedule.intervalDays,
          nextReviewAt: schedule.nextReviewAt,
        }),
      );

      // Existing views still use these fields; do not overwrite their
      // independent correctness counters or mastery metrics.
      return {
        vocabularyId,
        rating,
        repetitions: saved.repetitions,
        lapses: saved.lapses,
        easeFactor: saved.easeFactor,
        intervalDays: saved.intervalDays,
        nextReviewAt: saved.nextReviewAt,
      };
    });
  }

  async getUpcoming(
    userId: string,
    requestedLimit = 6,
    requestedPage = 1,
    tabId?: string,
  ) {
    const limit = this.normalizeLimit(requestedLimit);
    const page = this.normalizePage(requestedPage);
    const now = new Date();
    const query = this.filterTab(
      this.progress
        .createQueryBuilder('p')
        .innerJoinAndSelect('p.vocabulary', 'v', 'v.userId = :userId', {
          userId,
        })
        .where('p.userId = :userId', { userId }),
      tabId,
    )
      // A due/overdue review is still scheduled and should remain visible.
      // Previously excluding it made the panel empty once all cards became due.
      .orderBy('p.nextReviewAt', 'ASC')
      .addOrderBy('p.id', 'ASC');

    const total = await query.getCount();
    const pageCount = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pageCount);
    const progress = await query
      .skip((currentPage - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: progress.map((p) => ({
        vocabularyId: p.vocabularyId,
        word: p.vocabulary.word,
        meaning: p.vocabulary.meaning,
        nextReviewAt: p.nextReviewAt,
        intervalDays: p.intervalDays,
        isDue: p.nextReviewAt <= now,
      })),
      meta: { page: currentPage, limit, total, pageCount },
    };
  }

  async getHistory(
    userId: string,
    requestedLimit = 6,
    requestedPage = 1,
    tabId?: string,
  ) {
    const limit = this.normalizeLimit(requestedLimit);
    const page = this.normalizePage(requestedPage);
    const query = this.filterTab(
      this.reviews
        .createQueryBuilder('r')
        .innerJoinAndSelect('r.vocabulary', 'v', 'v.userId = :userId', {
          userId,
        })
        .where('r.userId = :userId', { userId }),
      tabId,
    )
      .orderBy('r.createdAt', 'DESC')
      .addOrderBy('r.id', 'DESC');

    const total = await query.getCount();
    const pageCount = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pageCount);
    const reviews = await query
      .skip((currentPage - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: reviews.map((r) => ({
        id: r.id,
        vocabularyId: r.vocabularyId,
        word: r.vocabulary.word,
        rating: r.rating,
        reviewedAt: r.createdAt,
        nextReviewAt: r.nextReviewAt,
      })),
      meta: { page: currentPage, limit, total, pageCount },
    };
  }

  private filterTab<T extends SelectQueryBuilder<any>>(
    query: T,
    tabId?: string,
  ): T {
    if (tabId) {
      query.innerJoin(
        'v.tabs',
        'srsSelectedTab',
        'srsSelectedTab.id = :tabId',
        { tabId },
      );
    }
    return query;
  }

  // SQLite stores TypeORM datetime values as UTC timestamps with a space separator.
  private sqlDate(value: Date): string {
    return value.toISOString().replace('T', ' ').replace('Z', '');
  }

  private normalizeLimit(value: number) {
    return Number.isFinite(value)
      ? Math.max(1, Math.min(20, Math.trunc(value)))
      : 6;
  }

  private normalizePage(value: number) {
    return Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1;
  }

  private formatCard(
    word: Vocabulary,
    progress: SrsProgress | null,
    isPracticeOnly = false,
  ) {
    return {
      id: word.id,
      word: word.word,
      pronunciation: word.pronunciation,
      meaning: word.meaning,
      example: word.example,
      exampleTranslation: word.exampleTranslation,
      note: word.note,
      image: word.image,
      audio: word.audio,
      isNew: !progress,
      isPracticeOnly,
      repetitions: progress?.repetitions ?? 0,
      lapses: progress?.lapses ?? 0,
      intervalDays: progress?.intervalDays ?? 0,
      nextReviewAt: progress?.nextReviewAt ?? null,
    };
  }
}
