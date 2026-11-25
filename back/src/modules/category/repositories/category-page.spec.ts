import { join } from 'path';
import { DataSource } from 'typeorm';
import { Category } from '../../../entities/category.entity';
import { User } from '../../../entities/user.entity';
import { Vocabulary } from '../../../entities/vocabulary.entity';
import { CategoryRepository } from './category.repository';
import { BulkCategoryDto } from '../dto/bulk-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Category advanced search and pagination (SQLite)', () => {
  let db: DataSource;
  let repository: CategoryRepository;
  let owner: User;
  let other: User;
  const query = (overrides: Partial<QueryCategoryDto> = {}) => Object.assign(new QueryCategoryDto(), overrides);

  beforeAll(async () => {
    db = new DataSource({ type: 'better-sqlite3', database: ':memory:', entities: [join(__dirname, '../../../entities/*.entity.ts')], synchronize: true });
    await db.initialize();
    const users = db.getRepository(User);
    owner = await users.save(users.create({ fullName: 'Category owner' }));
    other = await users.save(users.create({ fullName: 'Other owner' }));
    const words = db.getRepository(Vocabulary);
    const word = await words.save(words.create({ userId: owner.id, word: 'airplane', meaning: 'air travel', pronunciation: '/test/' }));
    const foreignWord = await words.save(words.create({ userId: other.id, word: 'privateword', meaning: 'private', pronunciation: '/test/' }));
    const categories = db.getRepository(Category);
    repository = new CategoryRepository(categories);
    for (let i = 1; i <= 19; i++) {
      await categories.save(categories.create({
        userId: owner.id,
        name: i === 1 ? 'Travel 100%_topic' : 'Topic ' + String(i).padStart(2, '0'),
        description: i === 1 ? 'Airport guide' : i === 2 ? 'Airport food' : 'General',
        color: i === 1 ? '#3B82F6' : '#112233',
        icon: i === 1 ? 'data:image/png;base64,AAAA' : 'book',
        isPinned: i === 1,
        pinnedAt: i === 1 ? new Date('2026-01-01') : null,
        createdAt: new Date(Date.UTC(2026, 0, i)),
        vocabularies: i === 1 ? [word, foreignWord] : [],
      }));
    }
    await categories.save(categories.create({ userId: other.id, name: 'Travel private', vocabularies: [foreignWord] }));
  });

  afterAll(async () => { if (db?.isInitialized) await db.destroy(); });

  it('returns 8 items per page, stable ordering, totals, and clamps the last page', async () => {
    const first = await repository.findPage(owner.id, query());
    const second = await repository.findPage(owner.id, query({ page: 2 }));
    const last = await repository.findPage(owner.id, query({ page: 999 }));
    expect(first).toMatchObject({ total: 19, totalCategories: 19, page: 1, pageCount: 3, limit: 8 });
    expect(first.data).toHaveLength(8);
    expect(second.data).toHaveLength(8);
    expect(last).toMatchObject({ page: 3, pageCount: 3 });
    expect(last.data).toHaveLength(3);
    expect(new Set([...first.data, ...second.data, ...last.data].map(x => x.id)).size).toBe(19);
    expect(first.data[0]).toMatchObject({ isPinned: true, vocabularyCount: 1 });
    expect(first.data[0]).not.toHaveProperty('vocabularies');
  });

  it('searches fields and combined terms, escaping SQL wildcards', async () => {
    const find = (options: Partial<QueryCategoryDto>) => repository.findPage(owner.id, query(options));
    expect((await find({ search: 'travel airport' })).total).toBe(1);
    expect((await find({ search: 'airport', scope: 'description' })).total).toBe(2);
    expect((await find({ search: 'airport', scope: 'name' })).total).toBe(0);
    expect((await find({ search: 'airplane', scope: 'vocabulary' })).total).toBe(1);
    expect((await find({ search: 'air travel', scope: 'vocabulary' })).total).toBe(1);
    expect((await find({ search: 'privateword' })).total).toBe(0);
    expect((await find({ search: '%_' })).total).toBe(1);
    expect((await find({ search: "' OR 1=1 --" })).total).toBe(0);
  });

  it('combines filters, returns correct counts and supports sorting', async () => {
    const one = await repository.findPage(owner.id, query({ pinned: 'pinned', content: 'populated', iconType: 'custom', color: '#3b82f6' }));
    expect(one).toMatchObject({ total: 1, totalCategories: 19, pageCount: 1 });
    expect(one.data[0].vocabularyCount).toBe(1);
    const empty = await repository.findPage(owner.id, query({ content: 'empty', iconType: 'preset', sort: 'nameAsc' }));
    expect(empty.total).toBe(18);
    expect(empty.data[0].name).toBe('Topic 02');
    const most = await repository.findPage(owner.id, query({ sort: 'mostWords' }));
    expect(most.data[0].vocabularyCount).toBe(1);
    const fewest = await repository.findPage(owner.id, query({ sort: 'fewestWords' }));
    expect(fewest.data[0].vocabularyCount).toBe(0);
    expect((await repository.findPage(other.id, query())).total).toBe(1);
  });

  it('validates query parameters and bounds', async () => {
    expect(await validate(plainToInstance(QueryCategoryDto, { page: '2', sort: 'newest' }))).toHaveLength(0);
    expect(await validate(plainToInstance(QueryCategoryDto, { page: '-1', sort: 'sql', color: 'bad', search: 'x'.repeat(201) }))).toHaveLength(4);
  });
  it('pins, unpins and deletes selected owned categories without deleting vocabulary', async () => {
    const categories = db.getRepository(Category);
    const first = await categories.findOneByOrFail({ userId: owner.id, name: 'Travel 100%_topic' });
    const second = await categories.findOneByOrFail({ userId: owner.id, name: 'Topic 02' });
    const foreign = await categories.findOneByOrFail({ userId: other.id });
    const ids = [first.id, second.id, foreign.id, second.id];
    const pin = await repository.bulk(owner.id, { action: 'pin', ids });
    expect(new Set(pin.processedIds)).toEqual(new Set([first.id, second.id]));
    expect(pin.failedIds).toEqual([foreign.id]);
    expect((await categories.findOneByOrFail({ id: second.id })).isPinned).toBe(true);
    expect((await categories.findOneByOrFail({ id: first.id })).pinnedAt).toEqual(first.pinnedAt);
    await repository.bulk(owner.id, { action: 'unpin', ids });
    expect((await categories.findOneByOrFail({ id: first.id })).pinnedAt).toBeNull();
    expect((await categories.findOneByOrFail({ id: second.id })).isPinned).toBe(false);
    const count = await db.getRepository(Vocabulary).count();
    const deleted = await repository.bulk(owner.id, { action: 'delete', ids });
    expect(deleted.processedIds).toHaveLength(2);
    expect(deleted.failedIds).toEqual([foreign.id]);
    expect(await categories.countBy({ userId: owner.id })).toBe(17);
    expect(await categories.countBy({ userId: other.id })).toBe(1);
    expect(await db.getRepository(Vocabulary).count()).toBe(count);
    expect(await db.query('SELECT COUNT(*) AS count FROM vocabulary_categories WHERE categoryId = ?', [first.id])).toEqual([{ count: 0 }]);
  });

  it('validates bulk action DTO and UUIDs', async () => {
    expect(await validate(plainToInstance(BulkCategoryDto, { action: 'pin', ids: ['bad-id'] }))).toHaveLength(1);
    expect(await validate(plainToInstance(BulkCategoryDto, { action: 'unknown', ids: [] }))).toHaveLength(2);
  });
});
