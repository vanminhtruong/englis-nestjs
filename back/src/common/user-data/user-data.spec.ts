import { join } from 'path';
import { DataSource } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryDateTopic } from '../../entities/category-date-topic.entity';
import { PracticeHistory, PracticeType } from '../../entities/practice-history.entity';
import { SrsProgress } from '../../entities/srs-progress.entity';
import { SrsReview } from '../../entities/srs-review.entity';
import { Tag } from '../../entities/tag.entity';
import { User } from '../../entities/user.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import {
  buildUserDataSnapshot,
  mergeChangeCount,
  mergeUserDataSnapshot,
} from './user-data-snapshot';
import { snapshotToXlsxBuffer, xlsxBufferToSnapshot } from './user-data-xlsx';

// ExcelJS is slow to load when the whole suite runs in parallel.
jest.setTimeout(30000);

describe('Export, import and sharing carry every page of the app', () => {
  let db: DataSource;
  let alice: User;
  let bob: User;
  let carol: User;

  const vocab = () => db.getRepository(Vocabulary);
  const wordsOf = async (userId: string) =>
    (await vocab().find({ where: { userId } })).map((v) => v.word).sort();

  const membersOfCategory = async (userId: string, name: string) => {
    const rows = await db
      .getRepository(Category)
      .createQueryBuilder('c')
      .leftJoin('c.vocabularies', 'v')
      .addSelect(['v.word'])
      .where('c.userId = :userId AND c.name = :name', { userId, name })
      .getMany();
    return rows.flatMap((c) => (c.vocabularies ?? []).map((v) => v.word)).sort();
  };
  const membersOfTab = async (userId: string, name: string) => {
    const rows = await db
      .getRepository(VocabularyTab)
      .createQueryBuilder('t')
      .leftJoin('t.vocabularies', 'v')
      .addSelect(['v.word'])
      .where('t.userId = :userId AND t.name = :name', { userId, name })
      .getMany();
    return rows.flatMap((t) => (t.vocabularies ?? []).map((v) => v.word)).sort();
  };

  beforeAll(async () => {
    db = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await db.initialize();

    const users = db.getRepository(User);
    alice = await users.save(users.create({ fullName: 'Alice', email: 'alice@example.com' }));
    bob = await users.save(users.create({ fullName: 'Bob', email: 'bob@example.com' }));
    carol = await users.save(users.create({ fullName: 'Carol', email: 'carol@example.com' }));

    const apple = await vocab().save(
      vocab().create({
        userId: alice.id,
        word: 'apple',
        meaning: 'fruit',
        pronunciation: '/a/',
        tags: ['fruit'],
        isPinned: true,
        pinnedAt: new Date('2026-11-02T00:00:00.000Z'),
        lastReviewedAt: new Date('2026-11-03T00:00:00.000Z'),
        nextReviewAt: new Date('2026-11-10T00:00:00.000Z'),
      }),
    );
    const book = await vocab().save(
      vocab().create({ userId: alice.id, word: 'book', meaning: 'sach', pronunciation: '/b/' }),
    );

    await db.getRepository(PracticeHistory).save(
      db.getRepository(PracticeHistory).create({
        userId: alice.id,
        vocabularyId: apple.id,
        practiceType: PracticeType.FLASHCARD,
        isCorrect: true,
        score: 10,
        timeSpent: 3,
      }),
    );

    const food = await db.getRepository(Category).save(
      db.getRepository(Category).create({
        userId: alice.id,
        name: 'Food',
        description: 'Things to eat',
        color: '#ff0000',
        isPinned: true,
        pinnedAt: new Date('2026-11-04T00:00:00.000Z'),
      }),
    );
    await db.getRepository(Category).save(
      db.getRepository(Category).create({ userId: alice.id, name: 'Empty' }),
    );
    apple.categories = [food];
    await vocab().save(apple);

    await db.getRepository(Tag).save(
      db.getRepository(Tag).create({
        userId: alice.id,
        name: 'fruit',
        description: 'Fruit words',
        color: '#00ff00',
      }),
    );
    await db.getRepository(CategoryDateTopic).save(
      db.getRepository(CategoryDateTopic).create({
        userId: alice.id,
        date: '2026-11-01',
        topic: 'Travel',
        icon: 'plane',
        color: '#0000ff',
      }),
    );
    await db.getRepository(VocabularyTab).save(
      db.getRepository(VocabularyTab).create({
        userId: alice.id,
        name: 'Work',
        sortOrder: 1,
        vocabularies: [book],
      }),
    );

    await db.getRepository(SrsProgress).save(
      db.getRepository(SrsProgress).create({
        userId: alice.id,
        vocabularyId: apple.id,
        repetitions: 3,
        lapses: 1,
        easeFactor: 2.1,
        intervalDays: 6,
        nextReviewAt: new Date('2026-11-10T00:00:00.000Z'),
        lastReviewedAt: new Date('2026-11-03T00:00:00.000Z'),
      }),
    );
    await db.getRepository(SrsReview).save(
      db.getRepository(SrsReview).create({
        userId: alice.id,
        vocabularyId: apple.id,
        rating: 'good',
        previousIntervalDays: 1,
        intervalDays: 6,
        nextReviewAt: new Date('2026-11-10T00:00:00.000Z'),
        createdAt: new Date('2026-11-03T00:00:00.000Z'),
      }),
    );
  });

  afterAll(async () => {
    if (db?.isInitialized) await db.destroy();
  });

  it('snapshots words, history, categories, tags, topics, tabs and Smart review', async () => {
    const { snapshot, overLimit } = await buildUserDataSnapshot(db.manager, alice.id);
    expect(overLimit).toBe(false);
    expect(snapshot.vocabularies.map((v) => v.word)).toEqual(['apple', 'book']);
    expect(snapshot.vocabularies[0]).toMatchObject({ isPinned: true, tags: ['fruit'] });
    expect(snapshot.histories).toHaveLength(1);
    expect(snapshot.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Food', color: '#ff0000', isPinned: true, words: ['apple'] }),
        expect.objectContaining({ name: 'Empty', words: [] }),
      ]),
    );
    expect(snapshot.tags).toEqual([expect.objectContaining({ name: 'fruit', color: '#00ff00' })]);
    expect(snapshot.dateTopics).toEqual([
      expect.objectContaining({ date: '2026-11-01', topic: 'Travel' }),
    ]);
    expect(snapshot.tabs).toEqual([expect.objectContaining({ name: 'Work', words: ['book'] })]);
    expect(snapshot.srsProgress).toEqual([
      expect.objectContaining({ word: 'apple', repetitions: 3, lapses: 1 }),
    ]);
    expect(snapshot.srsReviews).toEqual([expect.objectContaining({ word: 'apple', rating: 'good' })]);
  });

  it('reports an account with too many words instead of building a partial copy', async () => {
    const { overLimit } = await buildUserDataSnapshot(db.manager, alice.id, { maxVocabularies: 1 });
    expect(overLimit).toBe(true);
  });

  it('survives an Excel round trip without losing a page', async () => {
    const { snapshot } = await buildUserDataSnapshot(db.manager, alice.id);
    const back = await xlsxBufferToSnapshot(await snapshotToXlsxBuffer(snapshot));

    expect(back.vocabularies.map((v) => v.word)).toEqual(['apple', 'book']);
    expect(back.vocabularies[0]).toMatchObject({
      isPinned: true,
      pinnedAt: '2026-11-02T00:00:00.000Z',
      nextReviewAt: '2026-11-10T00:00:00.000Z',
      tags: ['fruit'],
    });
    expect(back.histories).toHaveLength(1);
    expect(back.categories.find((c) => c.name === 'Food')).toMatchObject({
      description: 'Things to eat',
      color: '#ff0000',
      isPinned: true,
      words: ['apple'],
    });
    expect(back.categories.find((c) => c.name === 'Empty')?.words).toEqual([]);
    expect(back.tags).toEqual([expect.objectContaining({ name: 'fruit', description: 'Fruit words' })]);
    expect(back.dateTopics).toEqual([
      expect.objectContaining({ date: '2026-11-01', topic: 'Travel', icon: 'plane' }),
    ]);
    expect(back.tabs).toEqual([expect.objectContaining({ name: 'Work', words: ['book'] })]);
    expect(back.srsProgress[0]).toMatchObject({ word: 'apple', repetitions: 3, easeFactor: 2.1 });
    expect(back.srsReviews[0]).toMatchObject({ word: 'apple', rating: 'good', intervalDays: 6 });
  });

  it('restores a backup into an empty account and ignores it the second time', async () => {
    const { snapshot } = await buildUserDataSnapshot(db.manager, alice.id);
    const file = await xlsxBufferToSnapshot(await snapshotToXlsxBuffer(snapshot));

    const first = await db.transaction((m) => mergeUserDataSnapshot(m, bob.id, file, 'import'));
    expect(first).toMatchObject({
      newVocabularies: 2,
      newHistories: 1,
      newCategories: 2,
      newTabs: 1,
      newDateTopics: 1,
      newSrsProgress: 1,
      newSrsReviews: 1,
    });
    expect(await wordsOf(bob.id)).toEqual(['apple', 'book']);
    expect(await membersOfCategory(bob.id, 'Food')).toEqual(['apple']);
    expect(await membersOfTab(bob.id, 'Work')).toEqual(['book']);
    const pinned = await vocab().findOneByOrFail({ userId: bob.id, word: 'apple' });
    expect(pinned.isPinned).toBe(true);
    const tag = await db.getRepository(Tag).findOneByOrFail({ userId: bob.id, name: 'fruit' });
    expect(tag.color).toBe('#00ff00');

    const again = await db.transaction((m) => mergeUserDataSnapshot(m, bob.id, file, 'import'));
    expect(mergeChangeCount(again)).toBe(0);
    expect(await wordsOf(bob.id)).toEqual(['apple', 'book']);
    expect(await db.getRepository(Category).count({ where: { userId: bob.id } })).toBe(2);
    expect(await db.getRepository(PracticeHistory).count({ where: { userId: bob.id } })).toBe(1);
    expect(await db.getRepository(SrsReview).count({ where: { userId: bob.id } })).toBe(1);
  });

  it('does not reset pinned words when importing a file from before those columns existed', async () => {
    const ExcelJS = require('exceljs') as typeof import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Vocabularies');
    sheet.addRow([
      'Word', 'Meaning', 'Pronunciation', 'Example', 'Example Translation', 'Note', 'Image',
      'Video', 'Audio', 'Difficulty', 'Mastery Level', 'Correct Count', 'Incorrect Count',
      'Tags', 'Is Favorite', 'Created At',
    ]);
    sheet.addRow([
      'apple', 'fruit', '/a/', '', '', '', '', '', '', 'easy', 'new', 0, 0, 'fruit', 'No',
      new Date('2026-01-01T00:00:00.000Z'),
    ]);
    const legacy = await xlsxBufferToSnapshot(Buffer.from(await workbook.xlsx.writeBuffer()));
    expect(legacy.vocabularies[0].isPinned).toBeUndefined();

    const stats = await db.transaction((m) => mergeUserDataSnapshot(m, bob.id, legacy, 'import'));
    expect(stats.updatedVocabularies).toBeLessThanOrEqual(1);
    const apple = await vocab().findOneByOrFail({ userId: bob.id, word: 'apple' });
    expect(apple.isPinned).toBe(true);
    expect(apple.nextReviewAt).not.toBeNull();
  });

  it('shares to someone who already has data without touching what they own', async () => {
    const own = await vocab().save(
      vocab().create({ userId: carol.id, word: 'book', meaning: 'her own meaning', pronunciation: '/c/' }),
    );
    await db.getRepository(Category).save(
      db.getRepository(Category).create({ userId: carol.id, name: 'food', color: '#123456' }),
    );

    const { snapshot } = await buildUserDataSnapshot(db.manager, alice.id);
    const stats = await db.transaction((m) =>
      mergeUserDataSnapshot(m, carol.id, JSON.parse(JSON.stringify(snapshot)), 'share'),
    );

    expect(stats).toMatchObject({ newVocabularies: 1, skippedVocabularies: 1, newHistories: 1 });
    expect(await wordsOf(carol.id)).toEqual(['apple', 'book']);

    // Her word is untouched and does not join the sender's tab.
    const kept = await vocab().findOneByOrFail({ id: own.id });
    expect(kept.meaning).toBe('her own meaning');
    expect(await membersOfTab(carol.id, 'Work')).toEqual([]);

    // Same category name (any case) is reused, and only the new word joins it.
    const food = await db.getRepository(Category).find({ where: { userId: carol.id } });
    expect(food.filter((c) => c.name.toLowerCase() === 'food')).toHaveLength(1);
    expect(food.find((c) => c.name === 'food')?.color).toBe('#123456');
    expect(await membersOfCategory(carol.id, 'food')).toEqual(['apple']);

    // Smart review only for the word that is new to her.
    const progress = await db.getRepository(SrsProgress).find({ where: { userId: carol.id } });
    expect(progress).toHaveLength(1);
    expect(progress[0].repetitions).toBe(3);
  });

  it('accepts offers made before categories and tabs were part of a share', async () => {
    const oldStyle = {
      vocabularies: [
        {
          word: 'legacy',
          pronunciation: '',
          meaning: 'old offer',
          example: '',
          exampleTranslation: '',
          note: '',
          image: null,
          video: null,
          audio: null,
          difficulty: 'easy',
          masteryLevel: 'new',
          correctCount: 0,
          incorrectCount: 0,
          tags: null,
          isFavorite: false,
          createdAt: new Date().toISOString(),
        },
      ],
      histories: [],
    };
    const stats = await db.transaction((m) => mergeUserDataSnapshot(m, carol.id, oldStyle, 'share'));
    expect(stats.newVocabularies).toBe(1);
    expect(stats.newCategories).toBe(0);
  });

  it('restores same-spelling classified senses and keeps their links separate through Excel', async () => {
    const users = db.getRepository(User);
    const from = await users.save(users.create({ fullName: 'Word senses source' }));
    const to = await users.save(users.create({ fullName: 'Word senses destination' }));
    const vr = db.getRepository(Vocabulary);
    const noun = await vr.save(vr.create({userId:from.id,word:'book',meaning:'volume',pronunciation:'/buk/',partOfSpeech:'noun' as any}));
    const verb = await vr.save(vr.create({userId:from.id,word:'book',meaning:'reserve',pronunciation:'/buk/',partOfSpeech:'verb' as any}));
    const cr = db.getRepository(Category);
    await cr.save(cr.create({userId:from.id,name:'Nouns',vocabularies:[noun]}));
    await cr.save(cr.create({userId:from.id,name:'Verbs',vocabularies:[verb]}));
    const pr = db.getRepository(PracticeHistory);
    await pr.save(pr.create({userId:from.id,vocabularyId:verb.id,practiceType:PracticeType.FLASHCARD,isCorrect:true,score:10,timeSpent:3}));
    const {snapshot} = await buildUserDataSnapshot(db.manager,from.id);
    const file = await xlsxBufferToSnapshot(await snapshotToXlsxBuffer(snapshot));
    expect(file.vocabularies.map(v=>v.partOfSpeech).sort()).toEqual(['noun','verb']);
    await db.transaction(m=>mergeUserDataSnapshot(m,to.id,file,'import'));
    const restored = await vr.find({where:{userId:to.id},relations:['categories']});
    expect(restored).toHaveLength(2);
    expect(restored.find(v=>v.partOfSpeech==='noun')?.categories.map(c=>c.name)).toEqual(['Nouns']);
    const restoredVerb=restored.find(v=>v.partOfSpeech==='verb');
    expect(restoredVerb?.categories.map(c=>c.name)).toEqual(['Verbs']);
    expect((await pr.findOneByOrFail({userId:to.id})).vocabularyId).toBe(restoredVerb?.id);
    const again=await db.transaction(m=>mergeUserDataSnapshot(m,to.id,file,'import'));
    expect(mergeChangeCount(again)).toBe(0);
  });
});
