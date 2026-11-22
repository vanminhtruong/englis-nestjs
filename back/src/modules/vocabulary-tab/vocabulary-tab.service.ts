import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MAX_TABS_PER_WORD } from './vocabulary-tab.constants';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { CreateVocabularyTabDto } from './dto/create-vocabulary-tab.dto';
import { UpdateVocabularyTabDto } from './dto/update-vocabulary-tab.dto';
import { AssignVocabularyTabsDto } from './dto/assign-vocabulary-tabs.dto';

@Injectable()
export class VocabularyTabService {
  constructor(
    @InjectRepository(VocabularyTab)
    private readonly vocabularyTabRepository: Repository<VocabularyTab>,
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async create(
    userId: string,
    createDto: CreateVocabularyTabDto,
  ): Promise<VocabularyTab> {
    const latest = await this.vocabularyTabRepository
      .createQueryBuilder('tab')
      .select('MAX(tab.sortOrder)', 'maxOrder')
      .where('tab.userId = :userId', { userId })
      .getRawOne<{ maxOrder: number | null }>();
    const tab = this.vocabularyTabRepository.create({
      name: createDto.name,
      icon: createDto.icon ?? null,
      userId,
      isDefault: false,
      sortOrder: Number(latest?.maxOrder ?? 0) + 1,
    });
    return this.vocabularyTabRepository.save(tab);
  }

  async findAll(userId: string): Promise<VocabularyTab[]> {
    const tabs = await this.ownedTabs(userId).getMany();
    // Stable sort preserves the existing order of tabs created before this field existed.
    return tabs.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async promoteFromOverflow(
    userId: string,
    tabId: string,
    previousTabId: string | null,
    updateSelection = false,
  ): Promise<VocabularyTab[]> {
    return this.vocabularyTabRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(VocabularyTab);
      const tabs = await repository.find({ where: { userId } });
      tabs.sort((a, b) => a.sortOrder - b.sortOrder);

      const selectedTab = tabs.find((tab) => tab.id === tabId);
      if (!selectedTab) throw new NotFoundException('Tab not found');

      const previousTab = previousTabId
        ? tabs.find((tab) => tab.id === previousTabId)
        : undefined;
      if (previousTabId && !previousTab) {
        throw new NotFoundException('Tab not found');
      }

      // Selected overflow tab first; previously active tab second; others remain in order.
      const front = [selectedTab];
      if (previousTab && previousTab.id !== selectedTab.id) front.push(previousTab);
      const retainedIds = new Set(front.map((tab) => tab.id));
      const reordered = [...front, ...tabs.filter((tab) => !retainedIds.has(tab.id))];

      for (const [index, tab] of reordered.entries()) {
        if (tab.sortOrder !== index + 1) {
          await repository.update({ id: tab.id, userId }, { sortOrder: index + 1 });
        }
        tab.sortOrder = index + 1;
      }
      if (updateSelection) {
        await manager.getRepository(Vocabulary).update({ userId }, { activeTabId: tabId });
      }
      return reordered;
    });
  }

  async findOne(userId: string, id: string): Promise<VocabularyTab> {
    const tab = await this.ownedTabs(userId)
      .andWhere('tab.id = :id', { id })
      .getOne();
    if (!tab) {
      // Same response for missing tabs and tabs owned by another account.
      throw new NotFoundException('Tab not found');
    }
    return tab;
  }

  private ownedTabs(userId: string) {
    // Filter loaded relationships too: legacy or corrupted links must not
    // expose another account's words in a tab response.
    return this.vocabularyTabRepository
      .createQueryBuilder('tab')
      .leftJoinAndSelect('tab.vocabularies', 'word', 'word.userId = :userId', {
        userId,
      })
      .where('tab.userId = :userId', { userId });
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateVocabularyTabDto,
  ): Promise<VocabularyTab> {
    const tab = await this.findOne(userId, id);
    if (updateDto.name !== undefined) tab.name = updateDto.name;
    if (updateDto.icon !== undefined) tab.icon = updateDto.icon;
    await this.vocabularyTabRepository.save(tab);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.vocabularyTabRepository.delete({ id, userId });
    // Remove the deleted tab from this user's saved selection only.
    await this.vocabularyRepository.update(
      { userId, activeTabId: id },
      { activeTabId: null },
    );
  }

  /**
   * Assign multiple owned words to multiple owned tabs atomically.
   * Existing memberships are kept, so All Vocabularies never loses words.
   * A different user's tab or word aborts the entire batch.
   */
  async assignVocabularies(userId: string, dto: AssignVocabularyTabsDto) {
    const tabIds = [...new Set(dto.tabIds)];
    const vocabularyIds = [...new Set(dto.vocabularyIds)];

    return this.vocabularyTabRepository.manager.transaction(async (manager) => {
      const tabs = await manager.getRepository(VocabularyTab).find({
        where: { id: In(tabIds), userId },
        relations: ['vocabularies'],
      });
      if (tabs.length !== tabIds.length) {
        throw new NotFoundException('Tab not found');
      }

      const words = await manager.getRepository(Vocabulary).find({
        where: { id: In(vocabularyIds), userId },
        relations: ['tabs'],
      });
      if (words.length !== vocabularyIds.length) {
        throw new NotFoundException('Vocabulary not found');
      }

      // Validate the whole batch *before* inserting any relation. A word may
      // already belong to selected tabs, and duplicates must not consume slots.
      // Keep the operation atomic: one full word must reject the entire batch.
      for (const word of words) {
        const existingTabIds = new Set(word.tabs.map((tab) => tab.id));
        const additions = tabIds.filter((id) => !existingTabIds.has(id)).length;
        if (
          additions > 0 &&
          existingTabIds.size + additions > MAX_TABS_PER_WORD
        ) {
          throw new ConflictException(
            `Each vocabulary word can belong to at most ${MAX_TABS_PER_WORD} tabs`,
          );
        }
      }

      let assignedCount = 0;
      let alreadyAssignedCount = 0;
      for (const tab of tabs) {
        const existingIds = new Set(tab.vocabularies.map((word) => word.id));
        const missingIds = vocabularyIds.filter((id) => !existingIds.has(id));
        alreadyAssignedCount += vocabularyIds.length - missingIds.length;
        if (missingIds.length) {
          await manager
            .createQueryBuilder()
            .relation(VocabularyTab, 'vocabularies')
            .of(tab.id)
            .add(missingIds);
          assignedCount += missingIds.length;
        }
      }
      return {
        assignedCount,
        alreadyAssignedCount,
        tabCount: tabs.length,
        vocabularyCount: vocabularyIds.length,
      };
    });
  }

  /**
   * Replace one word's tab memberships in one transaction.
   * Supports changing tab A -> tab D even when the word already has 3 tabs.
   */
  async replaceVocabularyTabs(
    userId: string,
    vocabularyId: string,
    requestedTabIds: string[],
  ): Promise<VocabularyTab[]> {
    const tabIds = [...new Set(requestedTabIds)];
    if (tabIds.length > MAX_TABS_PER_WORD) {
      throw new ConflictException(
        `Each vocabulary word can belong to at most ${MAX_TABS_PER_WORD} tabs`,
      );
    }

    return this.vocabularyTabRepository.manager.transaction(async (manager) => {
      const word = await manager.getRepository(Vocabulary).findOne({
        where: { id: vocabularyId, userId },
        relations: ['tabs'],
      });
      if (!word) throw new NotFoundException('Vocabulary not found');

      const tabs = tabIds.length
        ? await manager.getRepository(VocabularyTab).find({
            where: { id: In(tabIds), userId },
          })
        : [];
      if (tabs.length !== tabIds.length)
        throw new NotFoundException('Tab not found');

      word.tabs = tabs;
      await manager.getRepository(Vocabulary).save(word);
      return tabs;
    });
  }

  async addVocabulary(
    userId: string,
    tabId: string,
    vocabularyId: string,
  ): Promise<VocabularyTab> {
    const tab = await this.findOne(userId, tabId);
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id: vocabularyId, userId },
    });
    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }

    if (tab.vocabularies.some((v) => v.id === vocabulary.id)) {
      throw new ConflictException('Vocabulary already exists in this tab');
    }
    // Delegate to the same transactional validation as the bulk assignment API.
    await this.assignVocabularies(userId, {
      tabIds: [tabId],
      vocabularyIds: [vocabularyId],
    });
    return this.findOne(userId, tabId);
  }

  async removeVocabulary(
    userId: string,
    tabId: string,
    vocabularyId: string,
  ): Promise<VocabularyTab> {
    const tab = await this.findOne(userId, tabId);
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id: vocabularyId, userId },
    });
    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }
    tab.vocabularies = tab.vocabularies.filter((v) => v.id !== vocabularyId);
    await this.vocabularyTabRepository.save(tab);
    return this.findOne(userId, tabId);
  }
}
