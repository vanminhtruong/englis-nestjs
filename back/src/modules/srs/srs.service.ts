import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository, SelectQueryBuilder } from 'typeorm';
import { randomInt } from 'node:crypto';
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

    if (includeScheduled) {
      // Self-practice samples from ALL vocabulary in the selected tab first,
      // not just words that already have SRS progress. Random selection must
      // happen before the session limit so unreviewed words are equally eligible.
      const sampledWords = await this.filterTab(
        this.words.createQueryBuilder('v').where('v.userId = :userId', { userId }),
        tabId,
      )
        .orderBy('RANDOM()')
        .take(limit)
        .getMany();

      if (!sampledWords.length) return [];

      const states = await this.progress.find({
        where: {
          userId,
          vocabularyId: In(sampledWords.map((word) => word.id)),
        },
      });
      const stateByWordId = new Map(states.map((state) => [state.vocabularyId, state]));
      return sampledWords.map((word) => {
        const state = stateByWordId.get(word.id) ?? null;
        return this.formatCard(
          word,
          state,
          Boolean(state && state.nextReviewAt.getTime() > now.getTime()),
        );
      });
    }

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
    if (!remaining) return this.shuffleQueue(due);

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
    return this.shuffleQueue([
      ...due,
      ...newWords.map((word) => this.formatCard(word, null)),
    ]);
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
        // Extra practice records each attempt in history without advancing SRS.
        return this.recordPractice(manager, previous, rating, now);
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
          lastRating: rating,
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
          isPracticeOnly: false,
          createdAt: now,
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

  // Extra practice has a history event of its own, but never advances
  // the official next-review time or resets repetitions.
  private async recordPractice(
    manager: EntityManager,
    state: SrsProgress,
    rating: SrsRating,
    now: Date,
  ) {
    await manager.update(
      SrsProgress,
      { id: state.id, userId: state.userId, vocabularyId: state.vocabularyId },
      { lastRating: rating },
    );
    await manager.save(
      SrsReview,
      manager.create(SrsReview, {
        userId: state.userId,
        vocabularyId: state.vocabularyId,
        rating,
        previousIntervalDays: state.intervalDays,
        intervalDays: state.intervalDays,
        nextReviewAt: state.nextReviewAt,
        isPracticeOnly: true,
        createdAt: now,
      }),
    );
    return {
      vocabularyId: state.vocabularyId,
      rating,
      repetitions: state.repetitions,
      lapses: state.lapses,
      easeFactor: state.easeFactor,
      intervalDays: state.intervalDays,
      nextReviewAt: state.nextReviewAt,
      isPracticeOnly: true,
    };
  }

  async submitPracticeRating(
    userId: string,
    vocabularyId: string,
    rating: SrsRating,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const state = await manager.findOne(SrsProgress, {
        where: { userId, vocabularyId },
        relations: { vocabulary: true },
      });
      if (!state || state.vocabulary?.userId !== userId) {
        throw new NotFoundException('Vocabulary progress not found');
      }
      if (state.nextReviewAt.getTime() <= Date.now()) {
        throw new ConflictException('Card is due for a regular SRS review');
      }
      return this.recordPractice(manager, state, rating, new Date());
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
      // Only words the learner most recently marked Again or Hard belong
      // in the "needs attention" list. Legacy progress without lastRating
      // falls back to its most recent official review (SQLite rowid breaks
      // same-timestamp ties in favor of the last inserted review).
      .andWhere(
        `COALESCE(p.lastRating, (
          SELECT lastReview.rating
          FROM srs_reviews lastReview
          WHERE lastReview.userId = p.userId
            AND lastReview.vocabularyId = p.vocabularyId
          ORDER BY lastReview.createdAt DESC, lastReview.rowid DESC
          LIMIT 1
        )) IN (:...attentionRatings)`,
        { attentionRatings: ['again', 'hard'] },
      )
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
        partOfSpeech: p.vocabulary.partOfSpeech,
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
        partOfSpeech: r.vocabulary.partOfSpeech,
        rating: r.rating,
        isPracticeOnly: r.isPracticeOnly,
        reviewedAt: r.createdAt,
        nextReviewAt: r.nextReviewAt,
      })),
      meta: { page: currentPage, limit, total, pageCount },
    };
  }

  // Randomize presentation only; selection and SRS scheduling remain unchanged.
  private shuffleQueue<T>(cards: T[]): T[] {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
      partOfSpeech: word.partOfSpeech,
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
