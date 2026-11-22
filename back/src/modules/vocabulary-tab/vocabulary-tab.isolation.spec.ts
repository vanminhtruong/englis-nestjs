import { NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { VocabularyTabService } from './vocabulary-tab.service';

describe('Vocabulary tabs are private to the authenticated account', () => {
  let database: DataSource;
  let service: VocabularyTabService;
  let userA: User;
  let userB: User;
  let wordA: Vocabulary;
  let wordB: Vocabulary;

  beforeAll(async () => {
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
    userA = await users.save(users.create({ fullName: 'A' }));
    userB = await users.save(users.create({ fullName: 'B' }));
    const vocabularies = database.getRepository(Vocabulary);
    wordA = await vocabularies.save(
      vocabularies.create({
        userId: userA.id,
        word: 'one',
        meaning: 'one',
        pronunciation: '/w/',
      }),
    );
    wordB = await vocabularies.save(
      vocabularies.create({
        userId: userB.id,
        word: 'two',
        meaning: 'two',
        pronunciation: '/t/',
      }),
    );
  });

  afterAll(async () => {
    if (database?.isInitialized) await database.destroy();
  });

  it('keeps creation and listing independent for two users', async () => {
    const tabA = await service.create(userA.id, { name: 'English' });
    const tabB = await service.create(userB.id, { name: 'English' });
    expect(tabA.userId).toBe(userA.id);
    expect(tabB.userId).toBe(userB.id);
    expect((await service.findAll(userA.id)).map((tab) => tab.id)).toEqual([
      tabA.id,
    ]);
    expect((await service.findAll(userB.id)).map((tab) => tab.id)).toEqual([
      tabB.id,
    ]);
  });

  it('denies reading, editing and deleting tabs of the other account', async () => {
    const tabA = (await service.findAll(userA.id))[0]!;
    await expect(service.findOne(userB.id, tabA.id)).rejects.toThrow(
      NotFoundException,
    );
    await expect(
      service.update(userB.id, tabA.id, { name: 'Stolen' }),
    ).rejects.toThrow(NotFoundException);
    await expect(service.remove(userB.id, tabA.id)).rejects.toThrow(
      NotFoundException,
    );
    expect((await service.findOne(userA.id, tabA.id)).name).toBe('English');
  });

  it("denies inserting or removing another account's vocabulary", async () => {
    const tabA = (await service.findAll(userA.id))[0]!;
    await expect(
      service.addVocabulary(userA.id, tabA.id, wordB.id),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.addVocabulary(userB.id, tabA.id, wordA.id),
    ).rejects.toThrow(NotFoundException);
    await service.addVocabulary(userA.id, tabA.id, wordA.id);
    await expect(
      service.removeVocabulary(userB.id, tabA.id, wordA.id),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.removeVocabulary(userA.id, tabA.id, wordB.id),
    ).rejects.toThrow(NotFoundException);
    expect(
      (await service.findOne(userA.id, tabA.id)).vocabularies.map(
        (word) => word.id,
      ),
    ).toEqual([wordA.id]);
  });

  it("deleting a tab clears only the owner's selection without deleting words", async () => {
    const tabA = (await service.findAll(userA.id))[0]!;
    const tabB = (await service.findAll(userB.id))[0]!;
    const repo = database.getRepository(Vocabulary);
    await repo.update({ id: wordA.id }, { activeTabId: tabA.id });
    await repo.update({ id: wordB.id }, { activeTabId: tabB.id });
    await service.remove(userA.id, tabA.id);
    expect(await service.findAll(userA.id)).toEqual([]);
    expect((await service.findAll(userB.id)).map((tab) => tab.id)).toEqual([
      tabB.id,
    ]);
    expect(
      (await repo.findOneByOrFail({ id: wordA.id })).activeTabId,
    ).toBeNull();
    expect((await repo.findOneByOrFail({ id: wordB.id })).activeTabId).toBe(
      tabB.id,
    );
  });

  it('assigns multiple words to multiple tabs idempotently and rejects foreign resources', async () => {
    const firstTab = await service.create(userA.id, { name: 'A1' });
    const secondTab = await service.create(userA.id, { name: 'A2' });
    const foreignTab = await service.create(userB.id, { name: 'B1' });

    const first = await service.assignVocabularies(userA.id, {
      tabIds: [firstTab.id, secondTab.id],
      vocabularyIds: [wordA.id],
    });
    expect(first.assignedCount).toBe(2);

    const retry = await service.assignVocabularies(userA.id, {
      tabIds: [firstTab.id, secondTab.id],
      vocabularyIds: [wordA.id],
    });
    expect(retry.assignedCount).toBe(0);
    expect(retry.alreadyAssignedCount).toBe(2);

    await expect(
      service.assignVocabularies(userA.id, {
        tabIds: [firstTab.id, foreignTab.id],
        vocabularyIds: [wordA.id],
      }),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.assignVocabularies(userA.id, {
        tabIds: [firstTab.id],
        vocabularyIds: [wordB.id],
      }),
    ).rejects.toThrow(NotFoundException);

    expect(
      (await service.findOne(userA.id, firstTab.id)).vocabularies.map(
        (word) => word.id,
      ),
    ).toEqual([wordA.id]);
    expect(
      (await service.findOne(userA.id, secondTab.id)).vocabularies.map(
        (word) => word.id,
      ),
    ).toEqual([wordA.id]);
    expect(
      (await service.findOne(userB.id, foreignTab.id)).vocabularies,
    ).toEqual([]);
    expect(
      await database.getRepository(Vocabulary).findOneBy({ id: wordA.id }),
    ).toBeTruthy();
  });
});
