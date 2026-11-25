import { join } from 'path';
import { DataSource } from 'typeorm';
import { Category } from '../../../entities/category.entity';
import { User } from '../../../entities/user.entity';
import { Vocabulary } from '../../../entities/vocabulary.entity';
import { PracticeHistory, PracticeType } from '../../../entities/practice-history.entity';
import { SrsReview } from '../../../entities/srs-review.entity';
import { CategoryRepository } from './category.repository';
import { QueryCategoryDto } from '../dto/query-category.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('Smart category recommendations (SQLite)', () => {
  let db: DataSource;
  let repository: CategoryRepository;
  let owner: User;
  let other: User;
  const now = new Date('2026-11-25T12:00:00Z');
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000);
  const find = (options: Partial<QueryCategoryDto> = {}, date = now) =>
    repository.findPage(owner.id, Object.assign(new QueryCategoryDto(), options), date);
  let staleWord: Vocabulary;

  beforeAll(async () => {
    db = new DataSource({ type: 'better-sqlite3', database: ':memory:', entities: [join(__dirname, '../../../entities/*.entity.ts')], synchronize: true });
    await db.initialize();
    const users = db.getRepository(User);
    owner = await users.save(users.create({ fullName: 'Learner' }));
    other = await users.save(users.create({ fullName: 'Other learner' }));
    const categories = db.getRepository(Category);
    repository = new CategoryRepository(categories);
    const words = db.getRepository(Vocabulary);
    const saveWord = (name: string, age: number, userId = owner.id) => words.save(words.create({ userId, word: name, meaning: name, pronunciation: '/test/', createdAt: daysAgo(age) }));
    const add = (name: string, vocabularies: Vocabulary[], age = 90, userId = owner.id) => categories.save(categories.create({ userId, name, createdAt: daysAgo(age), vocabularies }));
    const practice = (word: Vocabulary, day: number, userId = owner.id) => db.getRepository(PracticeHistory).save({userId, vocabularyId: word.id, practiceType: PracticeType.FLASHCARD, isCorrect: true, createdAt: daysAgo(day)});
    const review = (word: Vocabulary, day: number, userId = owner.id) => db.getRepository(SrsReview).save({userId, vocabularyId: word.id, rating: 'good', nextReviewAt: now, createdAt: daysAgo(day)});
    const frequent = await saveWord('frequent', 90);
    const second = await saveWord('second', 90);
    staleWord = await saveWord('stale', 90);
    const never = await saveWord('never', 60);
    const boundary = await saveWord('boundary', 60);
    const newWord = await saveWord('new', 1);
    const oldWord = await saveWord('old', 90);
    const foreignWord = await saveWord('foreign', 90, other.id);
    await add('Frequent', [frequent]);
    await add('Second', [second]);
    await add('Stale', [staleWord]);
    await add('Never studied', [never, foreignWord]);
    await add('Boundary', [boundary]);
    await add('Recently added', [oldWord, newWord]);
    await add('New category', [oldWord], 1);
    await add('Empty', []);
    await add('Other user', [foreignWord], 90, other.id);
    await practice(frequent, 1);
    await practice(frequent, 3);
    await review(frequent, 5);
    await practice(frequent, 31);
    await review(second, 2);
    await practice(second, 9);
    await practice(staleWord, 45);
    await review(staleWord, 20);
    await practice(boundary, 14);
    await practice(never, 1, other.id);
    await practice(foreignWord, 1, other.id);
    await review(foreignWord, 1, other.id);
    await practice(frequent, -1); // Future-dated records must not count.
  });
  afterAll(async () => { if (db?.isInitialized) await db.destroy(); });

  it('ranks recent practice and SRS without counting old or foreign records', async () => {
    const result = await find({ smart: 'interested' });
    expect(result.data.map(c => c.name)).toEqual(['Frequent', 'Second']);
    expect(result.data.map(c => c.smart.recentActivityCount)).toEqual([3, 2]);
    expect(result.smartSummary).toEqual({ interested: 2, neglected: 3, recommended: 5 });
    expect(result.totalCategories).toBe(8);
  });
  it('excludes empty/new topics, flags the exact 14-day boundary and never-studied topics', async () => {
    const result = await find({ smart: 'neglected' });
    expect(result.data.map(c => c.name)).toEqual(['Never studied', 'Stale', 'Boundary']);
    expect(result.data[0].smart).toMatchObject({ idleDays: 60, hasStudied: false, needsReview: true });
    expect(result.data[1].smart).toMatchObject({ idleDays: 20, hasStudied: true, needsReview: true });
    expect(result.data[2].smart.idleDays).toBe(14);
  });
  it('combines modes with search, sorting, normal pagination and global counts', async () => {
    const result = await find({ smart: 'recommended' });
    expect(result.total).toBe(5);
    expect(result.data.slice(0, 3).every(c => c.smart.needsReview)).toBe(true);
    const filtered = await find({ smart: 'recommended', search: 'Frequent', scope: 'name' });
    expect(filtered.total).toBe(1);
    expect(filtered.smartSummary).toEqual(result.smartSummary);
    const normal = await find({ sort: 'nameAsc' });
    expect(normal.data).toHaveLength(8);
    expect(normal.data[0].name).toBe('Boundary');
    expect(await validate(plainToInstance(QueryCategoryDto, { smart: 'bad' }))).toHaveLength(1);
  });
  it('removes reminder after fresh review', async () => {
    await db.getRepository(SrsReview).save({ userId: owner.id, vocabularyId: staleWord.id, rating: 'good', nextReviewAt: now, createdAt: now });
    const result = await find({ smart: 'neglected' });
    expect(result.data.map(c => c.name)).not.toContain('Stale');
    expect(result.smartSummary.neglected).toBe(2);
  });
});
