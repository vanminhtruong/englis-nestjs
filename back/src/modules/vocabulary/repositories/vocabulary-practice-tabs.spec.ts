import { join } from 'path';
import { DataSource } from 'typeorm';
import { Vocabulary } from '../../../entities/vocabulary.entity';
import { VocabularyTab } from '../../../entities/vocabulary-tab.entity';
import { User } from '../../../entities/user.entity';
import { Category } from '../../../entities/category.entity';
import { CategoryDateTopic } from '../../../entities/category-date-topic.entity';
import { VocabularyRepository } from './vocabulary.repository';

describe('Practice vocabulary tab scope (SQLite)', () => {
  let db: DataSource;
  let repository: VocabularyRepository;
  let userA: User;
  let userB: User;
  let tabA: VocabularyTab;
  let tabB: VocabularyTab;
  let alpha: Vocabulary;
  let beta: Vocabulary;
  let shared: Vocabulary;

  beforeAll(async () => {
    db = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await db.initialize();
    repository = new VocabularyRepository(
      db.getRepository(Vocabulary),
      db.getRepository(Category),
      db.getRepository(CategoryDateTopic),
    );
    const users = db.getRepository(User);
    userA = await users.save(users.create({ fullName: 'Practice learner' }));
    userB = await users.save(users.create({ fullName: 'Other learner' }));

    const words = db.getRepository(Vocabulary);
    const saveWord = (userId: string, word: string, date: string) =>
      words.save(
        words.create({
          userId,
          word,
          meaning: word + ' meaning',
          pronunciation: '/test/',
          createdAt: new Date(date),
        }),
      );

    alpha = await saveWord(
      userA.id,
      'practice-alpha',
      '2026-10-01T08:00:00.000Z',
    );
    beta = await saveWord(
      userA.id,
      'practice-beta',
      '2026-10-02T08:00:00.000Z',
    );
    shared = await saveWord(
      userA.id,
      'practice-shared',
      '2026-10-03T08:00:00.000Z',
    );
    const foreign = await saveWord(
      userB.id,
      'other-private-word',
      '2026-10-03T08:00:00.000Z',
    );

    const tabs = db.getRepository(VocabularyTab);
    tabA = await tabs.save(
      tabs.create({
        userId: userA.id,
        name: 'Practice A',
        vocabularies: [alpha, shared, foreign],
      }),
    );
    tabB = await tabs.save(
      tabs.create({
        userId: userA.id,
        name: 'Practice B',
        vocabularies: [beta, shared],
      }),
    );
  });

  afterAll(async () => {
    if (db?.isInitialized) await db.destroy();
  });

  it('only returns words in the selected owned tab for every practice mode', async () => {
    const ids = (words: Vocabulary[]) => words.map((word) => word.id).sort();
    expect(
      ids(await repository.findForPractice(userA.id, 10, tabA.id)),
    ).toEqual([alpha.id, shared.id].sort());
    expect(
      ids(await repository.findForPractice(userA.id, 10, tabB.id)),
    ).toEqual([beta.id, shared.id].sort());
    expect(ids(await repository.findForPractice(userA.id, 10))).toEqual(
      [alpha.id, beta.id, shared.id].sort(),
    );
    expect(
      await repository.findForPractice(userA.id, 10, 'missing-tab'),
    ).toEqual([]);
    expect(await repository.findForPractice(userB.id, 10, tabA.id)).toEqual([]);
    expect(await repository.findForPractice(userA.id, 1, tabA.id)).toHaveLength(
      1,
    );
  });

  it('deletes an owned vocabulary from all tabs without a SQLite FK error', async () => {
    // Use a dedicated word so the existing practice-tab tests remain independent.
    const words = db.getRepository(Vocabulary);
    const tabs = db.getRepository(VocabularyTab);
    const target = await words.save(words.create({
      userId: userA.id,
      word: 'deletable-tab-word',
      meaning: 'Delete test',
      pronunciation: '/test/',
    }));
    const first = await tabs.save(tabs.create({
      userId: userA.id,
      name: 'Delete test first tab',
      vocabularies: [target],
    }));
    const second = await tabs.save(tabs.create({
      userId: userA.id,
      name: 'Delete test second tab',
      vocabularies: [target],
    }));

    await repository.delete(target.id, userB.id);
    expect(await words.findOneBy({ id: target.id })).not.toBeNull();
    await expect(repository.delete(target.id, userA.id)).resolves.toBeUndefined();
    expect(await words.findOneBy({ id: target.id })).toBeNull();
    const remaining = await db.query(
      'SELECT COUNT(*) AS total FROM "vocabulary_tab_vocabularies_vocabularies" WHERE "vocabulariesId" = ?',
      [target.id],
    );
    expect(remaining[0].total).toBe(0);
    expect(await tabs.findOneBy({ id: first.id })).not.toBeNull();
    expect(await tabs.findOneBy({ id: second.id })).not.toBeNull();
    expect(await db.query('PRAGMA foreign_key_check')).toEqual([]);
  });

  it('filters date options and date vocabulary by the same tab', async () => {
    const datesA = await repository.findByLearningDate(userA.id, tabA.id);
    const datesB = await repository.findByLearningDate(userA.id, tabB.id);
    expect(datesA.map((item: { date: string }) => item.date).sort()).toEqual([
      '2026-10-01',
      '2026-10-03',
    ]);
    expect(datesB.map((item: { date: string }) => item.date).sort()).toEqual([
      '2026-10-02',
      '2026-10-03',
    ]);
    expect(
      datesA
        .flatMap((item: { vocabularies: Vocabulary[] }) =>
          item.vocabularies.map((word) => word.id),
        )
        .sort(),
    ).toEqual([alpha.id, shared.id].sort());
    expect(
      (await repository.findByLearningDate(userA.id)).flatMap(
        (item: { vocabularies: Vocabulary[] }) => item.vocabularies,
      ),
    ).toHaveLength(3);
    expect(
      await repository.findByLearningDate(userA.id, 'missing-tab'),
    ).toEqual([]);
  });
});
