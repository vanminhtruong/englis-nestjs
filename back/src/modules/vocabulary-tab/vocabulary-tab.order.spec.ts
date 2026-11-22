import { NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { VocabularyTabService } from './vocabulary-tab.service';
import { AddVocabularyTabSortOrder1795300000000 } from '../../migrations/1795300000000-AddVocabularyTabSortOrder';

describe('Vocabulary tab overflow ordering', () => {
  let database: DataSource;
  let service: VocabularyTabService;
  let ownerId: string;
  let otherUserId: string;

  beforeEach(async () => {
    database = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [join(__dirname, '../../entities/*.entity.ts')],
      synchronize: true,
      logging: false,
    });
    await database.initialize();
    service = new VocabularyTabService(
      database.getRepository(VocabularyTab),
      database.getRepository(Vocabulary),
    );
    const users = database.getRepository(User);
    ownerId = (await users.save(users.create({ fullName: 'Owner' }))).id;
    otherUserId = (await users.save(users.create({ fullName: 'Other' }))).id;
  });

  afterEach(async () => {
    if (database?.isInitialized) await database.destroy();
  });

  async function createTabs(names: string[], userId = ownerId) {
    const created: VocabularyTab[] = [];
    for (const name of names) {
      created.push(await service.create(userId, { name }));
    }
    return created;
  }

  it('promotes only the requested overflow tab, keeps the former selection second, and persists order', async () => {
    const [a, b, c, d, e, f] = await createTabs(['A', 'B', 'C', 'D', 'E', 'F']);
    expect((await service.findAll(ownerId)).map((tab) => tab.name)).toEqual([
      'A', 'B', 'C', 'D', 'E', 'F',
    ]);

    await service.promoteFromOverflow(ownerId, f!.id, c!.id);
    expect((await service.findAll(ownerId)).map((tab) => tab.id)).toEqual([
      f!.id, c!.id, a!.id, b!.id, d!.id, e!.id,
    ]);

    // A second overflow pick should make the previously selected F second.
    await service.promoteFromOverflow(ownerId, e!.id, f!.id);
    expect((await service.findAll(ownerId)).map((tab) => tab.id)).toEqual([
      e!.id, f!.id, c!.id, a!.id, b!.id, d!.id,
    ]);

    // Persisted values can be read by a fresh repository instance.
    const freshService = new VocabularyTabService(
      database.getRepository(VocabularyTab),
      database.getRepository(Vocabulary),
    );
    expect((await freshService.findAll(ownerId)).map((tab) => tab.id)).toEqual([
      e!.id, f!.id, c!.id, a!.id, b!.id, d!.id,
    ]);
  });

  it('persists the active selection and ordering in the same transaction', async () => {
    const [a, b, c] = await createTabs(['A', 'B', 'C']);
    const vocabularies = database.getRepository(Vocabulary);
    const word = await vocabularies.save(vocabularies.create({
      userId: ownerId,
      word: 'sample',
      meaning: 'example',
      pronunciation: '/sample/',
      activeTabId: a!.id,
    }));
    await service.promoteFromOverflow(ownerId, c!.id, a!.id, true);
    expect((await vocabularies.findOneByOrFail({ id: word.id })).activeTabId).toBe(c!.id);
    expect((await service.findAll(ownerId)).map((tab) => tab.id)).toEqual([c!.id, a!.id, b!.id]);
  });

  it('promotes from All without manufacturing a previous tab and appends new tabs at the end', async () => {
    const [a, b, c] = await createTabs(['A', 'B', 'C']);
    await service.promoteFromOverflow(ownerId, c!.id, null);
    const newTab = await service.create(ownerId, { name: 'D' });
    expect((await service.findAll(ownerId)).map((tab) => tab.id)).toEqual([
      c!.id, a!.id, b!.id, newTab.id,
    ]);
  });

  it('adds the order column to legacy data without deleting tabs, and tolerates re-running', async () => {
    const [oldTab] = await createTabs(['Legacy A']);
    const queryRunner = database.createQueryRunner();
    try {
      await queryRunner.dropColumn('vocabulary_tab', 'sortOrder');
      expect(await queryRunner.hasColumn('vocabulary_tab', 'sortOrder')).toBe(false);
      const migration = new AddVocabularyTabSortOrder1795300000000();
      await migration.up(queryRunner);
      expect(await queryRunner.hasColumn('vocabulary_tab', 'sortOrder')).toBe(true);
      expect((await service.findAll(ownerId)).map((tab) => tab.id)).toEqual([oldTab!.id]);
      await migration.up(queryRunner);
      expect((await service.findAll(ownerId)).map((tab) => tab.id)).toEqual([oldTab!.id]);
    } finally {
      await queryRunner.release();
    }
  });

  it('rejects foreign and missing tab IDs without changing either account', async () => {
    const [a, b] = await createTabs(['A', 'B']);
    const [foreign] = await createTabs(['Other'], otherUserId);
    await expect(
      service.promoteFromOverflow(ownerId, foreign!.id, a!.id),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.promoteFromOverflow(ownerId, b!.id, foreign!.id),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.promoteFromOverflow(otherUserId, a!.id, null),
    ).rejects.toThrow(NotFoundException);
    expect((await service.findAll(ownerId)).map((tab) => tab.id)).toEqual([
      a!.id, b!.id,
    ]);
    expect((await service.findAll(otherUserId)).map((tab) => tab.id)).toEqual([
      foreign!.id,
    ]);
  });
});
