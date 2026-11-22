import { ConflictException, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { validateSync } from 'class-validator';
import { ReplaceVocabularyTabsDto } from './dto/replace-vocabulary-tabs.dto';
import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { VocabularyTabService } from './vocabulary-tab.service';
import { MAX_TABS_PER_WORD } from './vocabulary-tab.constants';

describe('Maximum custom tabs per vocabulary word', () => {
  let database: DataSource;
  let service: VocabularyTabService;
  let userId: string;
  let foreignUserId: string;
  const ids: string[] = [];
  let foreignTabId: string;
  let counter = 0;

  const createWord = async (owner = userId) => {
    const word = await database.getRepository(Vocabulary).save(
      database.getRepository(Vocabulary).create({
        userId: owner,
        word: `limited-word-${++counter}`,
        meaning: 'meaning',
        pronunciation: '/test/',
      }),
    );
    return word.id;
  };

  const memberIds = async (vocabularyId: string) =>
    (
      await database.getRepository(Vocabulary).findOneOrFail({
        where: { id: vocabularyId },
        relations: ['tabs'],
      })
    ).tabs
      .map((tab) => tab.id)
      .sort();

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
    const userRepo = database.getRepository(User);
    userId = (
      await userRepo.save(userRepo.create({ fullName: 'Limit test owner' }))
    ).id;
    foreignUserId = (
      await userRepo.save(userRepo.create({ fullName: 'Other owner' }))
    ).id;
    for (let i = 0; i < 5; i++) {
      ids.push((await service.create(userId, { name: `Tab ${i + 1}` })).id);
    }
    foreignTabId = (await service.create(foreignUserId, { name: 'Not mine' }))
      .id;
  });

  afterAll(async () => {
    if (database?.isInitialized) await database.destroy();
  });

  it('enforces the limit on single-word assignment without changing existing links', async () => {
    const wordId = await createWord();
    for (const tabId of ids.slice(0, MAX_TABS_PER_WORD)) {
      await service.addVocabulary(userId, tabId, wordId);
    }
    expect(await memberIds(wordId)).toEqual(
      ids.slice(0, MAX_TABS_PER_WORD).sort(),
    );
    await expect(service.addVocabulary(userId, ids[3], wordId)).rejects.toThrow(
      ConflictException,
    );
    expect(await memberIds(wordId)).toHaveLength(MAX_TABS_PER_WORD);
    await expect(service.addVocabulary(userId, ids[0], wordId)).rejects.toThrow(
      'Vocabulary already exists',
    );
    await service.removeVocabulary(userId, ids[0], wordId);
    await service.addVocabulary(userId, ids[3], wordId);
    expect(await memberIds(wordId)).toHaveLength(MAX_TABS_PER_WORD);
  });

  it('handles duplicate and already-assigned tabs idempotently in batch calls', async () => {
    const wordId = await createWord();
    const first = await service.assignVocabularies(userId, {
      tabIds: [ids[0], ids[1], ids[0]],
      vocabularyIds: [wordId, wordId],
    });
    expect(first.assignedCount).toBe(2);
    const same = await service.assignVocabularies(userId, {
      tabIds: [ids[0], ids[1]],
      vocabularyIds: [wordId],
    });
    expect(same.assignedCount).toBe(0);
    expect(same.alreadyAssignedCount).toBe(2);

    await service.assignVocabularies(userId, {
      tabIds: [ids[1], ids[2]],
      vocabularyIds: [wordId],
    });
    await expect(
      service.assignVocabularies(userId, {
        tabIds: [ids[0], ids[3]],
        vocabularyIds: [wordId],
      }),
    ).rejects.toThrow(ConflictException);
    expect(await memberIds(wordId)).toEqual(ids.slice(0, 3).sort());
  });

  it('rejects an entire batch if just one word would exceed the limit', async () => {
    const full = await createWord();
    const available = await createWord();
    await service.assignVocabularies(userId, {
      tabIds: ids.slice(0, 3),
      vocabularyIds: [full],
    });
    await expect(
      service.assignVocabularies(userId, {
        tabIds: [ids[3]],
        vocabularyIds: [full, available],
      }),
    ).rejects.toThrow(ConflictException);
    expect(await memberIds(full)).toEqual(ids.slice(0, 3).sort());
    expect(await memberIds(available)).toEqual([]);
  });

  it('replaces exactly three tabs atomically and can clear all memberships', async () => {
    const wordId = await createWord();
    await service.assignVocabularies(userId, {
      tabIds: ids.slice(0, 3),
      vocabularyIds: [wordId],
    });
    await service.replaceVocabularyTabs(userId, wordId, [
      ids[1],
      ids[2],
      ids[3],
    ]);
    expect(await memberIds(wordId)).toEqual(ids.slice(1, 4).sort());

    await expect(
      service.replaceVocabularyTabs(userId, wordId, ids.slice(0, 4)),
    ).rejects.toThrow(ConflictException);
    expect(await memberIds(wordId)).toEqual(ids.slice(1, 4).sort());

    await expect(
      service.replaceVocabularyTabs(userId, wordId, [ids[1], foreignTabId]),
    ).rejects.toThrow(NotFoundException);
    expect(await memberIds(wordId)).toEqual(ids.slice(1, 4).sort());

    await service.replaceVocabularyTabs(userId, wordId, []);
    expect(await memberIds(wordId)).toEqual([]);
  });

  it('validates the replacement DTO before reaching the API service', () => {
    const invalid = Object.assign(new ReplaceVocabularyTabsDto(), {
      tabIds: ids.slice(0, 4),
    });
    const duplicates = Object.assign(new ReplaceVocabularyTabsDto(), {
      tabIds: [ids[0], ids[0]],
    });
    const valid = Object.assign(new ReplaceVocabularyTabsDto(), {
      tabIds: ids.slice(0, 3),
    });
    expect(validateSync(invalid).length).toBeGreaterThan(0);
    expect(validateSync(duplicates).length).toBeGreaterThan(0);
    expect(validateSync(valid)).toHaveLength(0);
  });

  it('does not permit changes to words belonging to another user', async () => {
    const wordId = await createWord(foreignUserId);
    await expect(
      service.replaceVocabularyTabs(userId, wordId, [ids[0]]),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.assignVocabularies(userId, {
        tabIds: [ids[0]],
        vocabularyIds: [wordId],
      }),
    ).rejects.toThrow(NotFoundException);
    expect(await memberIds(wordId)).toEqual([]);
  });
});
