import { DataSource } from 'typeorm';
import { join } from 'path';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { SrsProgress } from '../../entities/srs-progress.entity';
import { SrsReview } from '../../entities/srs-review.entity';
import { SrsService } from './srs.service';

describe('SRS storage and user isolation (in-memory SQLite)', () => {
  let database: DataSource;
  let service: SrsService;
  let userA: User;
  let userB: User;
  let word: Vocabulary;

  beforeAll(async () => {
    database = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await database.initialize();
    service = new SrsService(
      database.getRepository(Vocabulary),
      database.getRepository(SrsProgress),
      database.getRepository(SrsReview),
      database,
    );
    userA = await database
      .getRepository(User)
      .save(database.getRepository(User).create({ fullName: 'Learner A' }));
    userB = await database
      .getRepository(User)
      .save(database.getRepository(User).create({ fullName: 'Learner B' }));
    word = await database.getRepository(Vocabulary).save(
      database.getRepository(Vocabulary).create({
        userId: userA.id,
        word: 'apple',
        meaning: 'quả táo',
        pronunciation: '/ˈæp.əl/',
      }),
    );
  });

  afterAll(async () => {
    if (database?.isInitialized) await database.destroy();
  });

  it('queues only owned new vocabulary', async () => {
    const queueA = await service.getQueue(userA.id);
    const queueB = await service.getQueue(userB.id);
    expect(queueA).toHaveLength(1);
    expect(queueA[0].id).toBe(word.id);
    expect(queueA[0].isNew).toBe(true);
    expect(queueB).toEqual([]);
  });

  it('rejects cross-account review submissions', async () => {
    await expect(
      service.submitReview(userB.id, word.id, 'good'),
    ).rejects.toThrow(NotFoundException);
  });

  it('saves the next schedule and review history together', async () => {
    const result = await service.submitReview(userA.id, word.id, 'good');
    expect(result.intervalDays).toBe(1);
    expect(await service.getQueue(userA.id)).toEqual([]);

    const overview = await service.getOverview(userA.id);
    expect(overview.newWords).toBe(0);
    expect(overview.availableWords).toBe(0);
    expect(overview.reviewed24h).toBe(1);

    const history = await service.getHistory(userA.id);
    expect(history.meta.total).toBe(1);
    expect(history.data).toHaveLength(1);
    expect(history.data[0].rating).toBe('good');
    // A word remembered as Good is kept in SRS, but hidden from the attention list.
    expect((await service.getUpcoming(userA.id)).data).toEqual([]);
    expect((await service.getHistory(userB.id)).data).toEqual([]);
  });

  it('paginates upcoming and history independently with complete counts', async () => {
    const wordRepo = database.getRepository(Vocabulary);
    const progressRepo = database.getRepository(SrsProgress);
    const historyRepo = database.getRepository(SrsReview);
    const future = new Date(Date.now() + 4 * 86_400_000);

    for (let i = 0; i < 12; i++) {
      const vocabulary = await wordRepo.save(
        wordRepo.create({
          userId: userA.id,
          word: 'page-word-' + i,
          meaning: 'test',
          pronunciation: '/test/',
        }),
      );
      await progressRepo.save(
        progressRepo.create({
          userId: userA.id,
          vocabularyId: vocabulary.id,
          nextReviewAt: new Date(future.getTime() + i * 60_000),
        }),
      );
      await historyRepo.save(
        historyRepo.create({
          userId: userA.id,
          vocabularyId: vocabulary.id,
          rating: 'hard',
          nextReviewAt: future,
        }),
      );
    }

    const first = await service.getUpcoming(userA.id, 5, 1);
    const second = await service.getUpcoming(userA.id, 5, 2);
    const last = await service.getUpcoming(userA.id, 5, 99);
    expect(first.meta).toEqual({ page: 1, limit: 5, total: 12, pageCount: 3 });
    expect(second.data).toHaveLength(5);
    expect(last.meta.page).toBe(3);
    expect(last.data).toHaveLength(2);
    expect(first.data[0].vocabularyId).not.toBe(second.data[0].vocabularyId);

    const recent = await service.getHistory(userA.id, 5, 1);
    expect(recent.meta.total).toBe(13);
    expect(recent.data).toHaveLength(5);
    expect((await service.getHistory(userA.id, 5, 3)).data).toHaveLength(3);
    expect((await service.getUpcoming(userB.id, 5, 1)).meta.total).toBe(0);
    expect((await service.getHistory(userB.id, 5, 1)).meta.total).toBe(0);
  });

  it('shows already-due cards in the upcoming panel instead of hiding them', async () => {
    const progressRepo = database.getRepository(SrsProgress);
    const target = await progressRepo
      .createQueryBuilder('p')
      .innerJoin('p.vocabulary', 'v')
      .where('p.userId = :userId', { userId: userA.id })
      .andWhere('v.word = :word', { word: 'page-word-0' })
      .getOne();
    expect(target).not.toBeNull();
    await progressRepo.update(target!.id, {
      nextReviewAt: new Date(Date.now() - 60_000),
    });
    const upcoming = await service.getUpcoming(userA.id, 6, 1);
    expect(upcoming.meta.total).toBe(12);
    expect(upcoming.data[0].vocabularyId).toBe(target!.vocabularyId);
    expect(upcoming.data[0].isDue).toBe(true);
    expect(upcoming.data.some((card) => card.isDue === false)).toBe(true);
  });

  it('still lists the cards when every scheduled review is overdue', async () => {
    await database
      .getRepository(SrsProgress)
      .createQueryBuilder()
      .update()
      .set({ nextReviewAt: new Date(Date.now() - 120_000) })
      .where('userId = :userId', { userId: userA.id })
      .execute();
    const first = await service.getUpcoming(userA.id, 6, 1);
    const last = await service.getUpcoming(userA.id, 6, 3);
    expect(first.meta.total).toBe(12);
    expect(first.data).toHaveLength(6);
    expect(first.data.every((card) => card.isDue)).toBe(true);
    expect(last.meta.page).toBe(2);
    expect(last.data).toHaveLength(6);
    expect(last.data.every((card) => card.isDue)).toBe(true);
  });

  it('scopes counts, queue, schedule and history by existing vocabulary tabs', async () => {
    const wordRepo = database.getRepository(Vocabulary);
    const tabRepo = database.getRepository(VocabularyTab);
    const progressRepo = database.getRepository(SrsProgress);
    const historyRepo = database.getRepository(SrsReview);
    const newWord = (userId: string, name: string) =>
      wordRepo.save(
        wordRepo.create({
          userId,
          word: name,
          pronunciation: '/test/',
          meaning: 'Test word',
        }),
      );
    const [alpha, beta, shared, foreign] = await Promise.all([
      newWord(userA.id, 'SRS alpha'),
      newWord(userA.id, 'SRS beta'),
      newWord(userA.id, 'SRS shared'),
      newWord(userB.id, 'SRS private'),
    ]);
    const tabA = await tabRepo.save(
      tabRepo.create({
        name: 'SRS test A',
        vocabularies: [alpha, shared, foreign],
      }),
    );
    const tabB = await tabRepo.save(
      tabRepo.create({
        name: 'SRS test B',
        vocabularies: [beta, shared],
      }),
    );
    const dueAt = new Date(Date.now() - 60_000);
    await progressRepo.save(
      progressRepo.create({
        userId: userA.id,
        vocabularyId: shared.id,
        nextReviewAt: dueAt,
      }),
    );
    await historyRepo.save(
      historyRepo.create({
        userId: userA.id,
        vocabularyId: shared.id,
        rating: 'hard',
        nextReviewAt: dueAt,
      }),
    );

    const overviewA = await service.getOverview(userA.id, tabA.id);
    const overviewB = await service.getOverview(userA.id, tabB.id);
    expect(overviewA.totalWords).toBe(2);
    expect(overviewA.newWords).toBe(1);
    expect(overviewA.dueWords).toBe(1);
    expect(overviewA.availableWords).toBe(2);
    expect(overviewA.reviewed24h).toBe(1);
    expect(overviewB.totalWords).toBe(2);
    expect(overviewB.newWords).toBe(1);

    const queueA = await service.getQueue(userA.id, 20, tabA.id);
    const queueB = await service.getQueue(userA.id, 20, tabB.id);
    expect(queueA.map((card) => card.id).sort()).toEqual([shared.id, alpha.id].sort());
    expect(queueB.map((card) => card.id).sort()).toEqual([shared.id, beta.id].sort());
    expect(
      (await service.getUpcoming(userA.id, 6, 1, tabA.id)).data.map(
        (item) => item.vocabularyId,
      ),
    ).toEqual([shared.id]);
    expect((await service.getHistory(userA.id, 6, 1, tabA.id)).meta.total).toBe(
      1,
    );
    expect((await service.getHistory(userA.id, 6, 1, tabB.id)).meta.total).toBe(
      1,
    );

    expect(
      (await service.getOverview(userA.id, 'not-a-real-tab')).totalWords,
    ).toBe(0);
    expect(await service.getQueue(userA.id, 20, 'not-a-real-tab')).toEqual([]);
    expect(
      (await service.getUpcoming(userB.id, 6, 1, tabA.id)).meta.total,
    ).toBe(0);
    expect((await service.getOverview(userB.id, tabA.id)).totalWords).toBe(1);

    // Moving words between tabs must affect SRS immediately without modifying progress.
    tabA.vocabularies = [shared, foreign];
    await tabRepo.save(tabA);
    expect((await service.getOverview(userA.id, tabA.id)).totalWords).toBe(1);
    expect((await service.getOverview(userA.id)).totalWords).toBeGreaterThan(2);
  });

  it('allows optional self-practice of scheduled words without changing SRS data', async () => {
    const tabRepo = database.getRepository(VocabularyTab);
    const scheduledTab = await tabRepo.save(
      tabRepo.create({ name: 'Scheduled practice tab', vocabularies: [word] }),
    );
    const future = new Date(Date.now() + 2 * 86_400_000);
    await database.getRepository(SrsProgress).update(
      { userId: userA.id, vocabularyId: word.id },
      { nextReviewAt: future },
    );

    expect(await service.getQueue(userA.id, 20, scheduledTab.id)).toEqual([]);
    const before = await database.getRepository(SrsReview).count();
    const cards = await service.getQueue(userA.id, 20, scheduledTab.id, true);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      id: word.id,
      isNew: false,
      isPracticeOnly: true,
    });
    expect(await service.getQueue(userB.id, 20, scheduledTab.id, true)).toEqual([]);
    expect(await service.getQueue(userA.id, 20, 'missing-tab', true)).toEqual([]);
    expect(await database.getRepository(SrsReview).count()).toBe(before);
    expect(
      (await database.getRepository(SrsProgress).findOneByOrFail({
        userId: userA.id,
        vocabularyId: word.id,
      })).nextReviewAt.getTime(),
    ).toBe(future.getTime());
  });

  it('includes all six tab words when two are new and four are scheduled for later', async () => {
    const wordRepo = database.getRepository(Vocabulary);
    const progressRepo = database.getRepository(SrsProgress);
    const tabRepo = database.getRepository(VocabularyTab);
    const words = await wordRepo.save(
      Array.from({ length: 6 }, (_, i) =>
        wordRepo.create({
          userId: userA.id,
          word: 'mixed-srs-' + i,
          meaning: 'test word',
          pronunciation: '/test/',
        }),
      ),
    );
    const tab = await tabRepo.save(
      tabRepo.create({ name: 'Six word practice', vocabularies: words }),
    );
    const future = new Date(Date.now() + 2 * 86_400_000);
    await progressRepo.save(
      words.slice(2).map((vocabulary) =>
        progressRepo.create({
          userId: userA.id,
          vocabularyId: vocabulary.id,
          nextReviewAt: future,
        }),
      ),
    );

    const regular = await service.getQueue(userA.id, 20, tab.id);
    expect(regular).toHaveLength(2);
    const fullPractice = await service.getQueue(userA.id, 20, tab.id, true);
    expect(fullPractice).toHaveLength(6);
    expect(fullPractice.map((card) => card.id).sort()).toEqual(
      words.map((vocabulary) => vocabulary.id).sort(),
    );
    expect(fullPractice.filter((card) => card.isPracticeOnly)).toHaveLength(4);
    expect(fullPractice.filter((card) => card.isNew)).toHaveLength(2);
  });

  it('randomly samples unreviewed words before the limit (English: 4 new + 2 scheduled)', async () => {
    const wordRepo = database.getRepository(Vocabulary);
    const progressRepo = database.getRepository(SrsProgress);
    const tabRepo = database.getRepository(VocabularyTab);
    const words = await wordRepo.save(
      ['Fan', 'Mortal', 'Roof', 'Sea', 'Fate', 'Emergency'].map((text) =>
        wordRepo.create({
          userId: userA.id,
          word: 'random-' + text,
          pronunciation: '/test/',
          meaning: 'test word',
        }),
      ),
    );
    const tab = await tabRepo.save(
      tabRepo.create({ name: 'Random English sample', vocabularies: words }),
    );
    const future = new Date(Date.now() + 2 * 86_400_000);
    await progressRepo.save(
      words.slice(4).map((vocabulary) =>
        progressRepo.create({
          userId: userA.id,
          vocabularyId: vocabulary.id,
          nextReviewAt: future,
        }),
      ),
    );

    const fullQueue = await service.getQueue(userA.id, 10, tab.id, true);
    expect(fullQueue).toHaveLength(6);
    expect(fullQueue.map((card) => card.id).sort()).toEqual(
      words.map((vocabulary) => vocabulary.id).sort(),
    );
    expect(fullQueue.filter((card) => card.isNew)).toHaveLength(4);
    expect(fullQueue.filter((card) => card.isPracticeOnly)).toHaveLength(2);

    // Each 3-card session must be sampled from all six, not from two
    // scheduled cards or from a fixed prefix of four new cards.
    const seen = new Set<string>();
    const orders = new Set<string>();
    for (let round = 0; round < 24; round++) {
      const cards = await service.getQueue(userA.id, 3, tab.id, true);
      expect(cards).toHaveLength(3);
      expect(new Set(cards.map((card) => card.id)).size).toBe(3);
      cards.forEach((card) => seen.add(card.id));
      orders.add(cards.map((card) => card.id).join('|'));
    }
    expect(seen.size).toBe(6);
    expect(orders.size).toBeGreaterThan(1);
  });

  it('lists only most recently forgotten or hard words, not remembered or easy words', async () => {
    const wordRepo = database.getRepository(Vocabulary);
    const tabRepo = database.getRepository(VocabularyTab);
    const progressRepo = database.getRepository(SrsProgress);
    const sample = await wordRepo.save(
      (['again', 'hard', 'good', 'easy'] as const).map((rating) =>
        wordRepo.create({
          userId: userA.id,
          word: 'attention-' + rating,
          meaning: 'attention test',
          pronunciation: '/test/',
        }),
      ),
    );
    const tab = await tabRepo.save(
      tabRepo.create({ name: 'Difficulty filter', vocabularies: sample }),
    );
    for (let i = 0; i < sample.length; i++) {
      await service.submitReview(
        userA.id,
        sample[i].id,
        (['again', 'hard', 'good', 'easy'] as const)[i],
      );
    }

    let upcoming = await service.getUpcoming(userA.id, 6, 1, tab.id);
    expect(upcoming.meta.total).toBe(2);
    expect(upcoming.data.map((card) => card.word).sort()).toEqual([
      'attention-again',
      'attention-hard',
    ]);
    // The SRS schedule is still saved for all four words.
    expect(await progressRepo.countBy({ userId: userA.id })).toBeGreaterThanOrEqual(4);

    // A new Good assessment removes a previously hard word from the list.
    await progressRepo.update(
      { userId: userA.id, vocabularyId: sample[1].id },
      { nextReviewAt: new Date(Date.now() - 10_000) },
    );
    await service.submitReview(userA.id, sample[1].id, 'good');
    upcoming = await service.getUpcoming(userA.id, 6, 1, tab.id);
    expect(upcoming.data.map((card) => card.word)).toEqual(['attention-again']);
    expect(upcoming.meta.total).toBe(1);
  });

  it('updates the attention list from extra practice without moving the SRS due date', async () => {
    const wordRepo = database.getRepository(Vocabulary);
    const tabRepo = database.getRepository(VocabularyTab);
    const progressRepo = database.getRepository(SrsProgress);
    const wordForPractice = await wordRepo.save(
      wordRepo.create({
        userId: userA.id,
        word: 'practice-difficulty-test',
        meaning: 'practice',
        pronunciation: '/test/',
      }),
    );
    const tab = await tabRepo.save(
      tabRepo.create({ name: 'Practice rating tab', vocabularies: [wordForPractice] }),
    );
    await service.submitReview(userA.id, wordForPractice.id, 'again');
    const before = await progressRepo.findOneByOrFail({
      userId: userA.id,
      vocabularyId: wordForPractice.id,
    });
    const beforeReviewCount = await database.getRepository(SrsReview).count();
    expect((await service.getUpcoming(userA.id, 6, 1, tab.id)).meta.total).toBe(1);

    await service.submitPracticeRating(userA.id, wordForPractice.id, 'easy');
    expect((await service.getUpcoming(userA.id, 6, 1, tab.id)).meta.total).toBe(0);

    await service.submitPracticeRating(userA.id, wordForPractice.id, 'hard');
    expect((await service.getUpcoming(userA.id, 6, 1, tab.id)).meta.total).toBe(1);

    await service.submitPracticeRating(userA.id, wordForPractice.id, 'good');
    expect((await service.getUpcoming(userA.id, 6, 1, tab.id)).meta.total).toBe(0);

    const after = await progressRepo.findOneByOrFail({
      userId: userA.id,
      vocabularyId: wordForPractice.id,
    });
    expect(after.lastRating).toBe('good');
    expect(after.nextReviewAt.getTime()).toBe(before.nextReviewAt.getTime());
    expect(after.lastReviewedAt?.getTime()).toBe(before.lastReviewedAt?.getTime());
    expect(await database.getRepository(SrsReview).count()).toBe(beforeReviewCount + 3);
    const entries = await service.getHistory(userA.id, 6, 1, tab.id);
    expect(entries.meta.total).toBe(4);
    expect(entries.data.filter((item) => item.isPracticeOnly)).toHaveLength(3);
    expect(entries.data.some((item) => item.rating === 'hard' && item.isPracticeOnly)).toBe(true);
    expect(entries.data.some((item) => item.rating === 'easy' && item.isPracticeOnly)).toBe(true);
    expect(entries.data.some((item) => item.rating === 'again' && !item.isPracticeOnly)).toBe(true);
    await expect(
      service.submitPracticeRating(userB.id, wordForPractice.id, 'hard'),
    ).rejects.toThrow(NotFoundException);
  });

  it('accepts extra practice through the existing review endpoint without changing the schedule', async () => {
    const progressRepo = database.getRepository(SrsProgress);
    await progressRepo.update(
      { userId: userA.id, vocabularyId: word.id },
      { nextReviewAt: new Date(Date.now() + 86_400_000) },
    );
    const before = await progressRepo.findOneByOrFail({
      userId: userA.id,
      vocabularyId: word.id,
    });
    const previousReviews = await database.getRepository(SrsReview).count();
    const result = await service.submitReview(userA.id, word.id, 'hard');
    expect(result).toMatchObject({
      vocabularyId: word.id,
      rating: 'hard',
      isPracticeOnly: true,
    });
    const after = await progressRepo.findOneByOrFail({
      userId: userA.id,
      vocabularyId: word.id,
    });
    expect(after.lastRating).toBe('hard');
    expect(after.nextReviewAt.getTime()).toBe(before.nextReviewAt.getTime());
    expect(after.lastReviewedAt?.getTime()).toBe(before.lastReviewedAt?.getTime());
    expect(await database.getRepository(SrsReview).count()).toBe(previousReviews + 1);
    const latestPractice = await database.getRepository(SrsReview).findOne({
      where: { userId: userA.id, vocabularyId: word.id, isPracticeOnly: true },
      order: { createdAt: 'DESC' },
    });
    expect(latestPractice).toMatchObject({ rating: 'hard', isPracticeOnly: true });
    expect(latestPractice?.nextReviewAt.getTime()).toBe(before.nextReviewAt.getTime());
    await expect(
      service.submitReview(userB.id, word.id, 'again'),
    ).rejects.toThrow(NotFoundException);
  });
});
