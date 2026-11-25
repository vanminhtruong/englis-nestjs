import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Vocabulary, PartOfSpeech } from '../../../entities/vocabulary.entity';
import { Category } from '../../../entities/category.entity';
import { CategoryDateTopic } from '../../../entities/category-date-topic.entity';

import {
  assertVocabularyIdentity,
  checkVocabularyIdentity,
  normalizeIdentity,
} from './vocabulary-identity';
import { CheckDuplicateDto } from '../dto/check-duplicate.dto';

@Injectable()
export class VocabularyRepository {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly repository: Repository<Vocabulary>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(CategoryDateTopic)
    private readonly topicRepository: Repository<CategoryDateTopic>,
  ) {}

  private readonly identityQueue = new Map<string, Promise<void>>();

  private async serializeIdentity<T>(
    userId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = this.identityQueue.get(userId) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => gate);
    this.identityQueue.set(userId, tail);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (this.identityQueue.get(userId) === tail)
        this.identityQueue.delete(userId);
    }
  }

  async checkDuplicate(userId: string, input: CheckDuplicateDto) {
    const result = await checkVocabularyIdentity(
      this.repository,
      userId,
      input,
      input.excludeId,
    );
    const previous = input.excludeId
      ? await this.findById(input.excludeId, userId)
      : null;
    // Existing records with unchanged identity may still be edited.
    const unchanged =
      previous &&
      normalizeIdentity(previous.word) === normalizeIdentity(input.word) &&
      normalizeIdentity(previous.meaning) ===
        normalizeIdentity(input.meaning) &&
      previous.partOfSpeech ===
        (input.partOfSpeech ?? PartOfSpeech.UNSPECIFIED);
    return { ...result, duplicate: unchanged ? false : result.duplicate };
  }

  async findAll(userId: string): Promise<Vocabulary[]> {
    return this.repository.find({
      where: { userId },
      relations: ['categories'],
      order: { isPinned: 'DESC', pinnedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findAllPaginated(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    difficulty?: 'easy' | 'medium' | 'hard',
    tabId?: string,
    categoryIds?: string[],
    tags?: string[],
    partOfSpeech?: PartOfSpeech,
  ): Promise<{ items: Vocabulary[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('vocabulary')
      .leftJoinAndSelect('vocabulary.categories', 'categories')
      .where('vocabulary.userId = :userId', { userId })
      .orderBy('vocabulary.isPinned', 'DESC')
      .addOrderBy('vocabulary.pinnedAt', 'DESC')
      .addOrderBy('vocabulary.createdAt', 'DESC');

    if (tabId) {
      qb.innerJoin('vocabulary.tabs', 'tab', 'tab.id = :tabId', { tabId });
    }

    if (search && search.trim()) {
      const s = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(vocabulary.word) LIKE :s OR LOWER(vocabulary.meaning) LIKE :s)',
        { s },
      );
    }

    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      qb.andWhere('vocabulary.difficulty = :difficulty', { difficulty });
    }

    if (partOfSpeech && Object.values(PartOfSpeech).includes(partOfSpeech)) {
      qb.andWhere('vocabulary.partOfSpeech = :partOfSpeech', { partOfSpeech });
    }

    // Filter by category IDs (vocabulary must be in at least one of the selected categories)
    if (categoryIds && categoryIds.length > 0) {
      qb.innerJoin(
        'vocabulary.categories',
        'filterCategory',
        'filterCategory.id IN (:...categoryIds)',
        { categoryIds },
      );
    }

    // Filter by tags (vocabulary must have at least one of the selected tags)
    if (tags && tags.length > 0) {
      const tagConditions = tags.map(
        (tag, index) => `vocabulary.tags LIKE :filterTag${index}`,
      );
      const tagParams = tags.reduce(
        (acc, tag, index) => {
          acc[`filterTag${index}`] = `%${tag}%`;
          return acc;
        },
        {} as Record<string, string>,
      );
      qb.andWhere(`(${tagConditions.join(' OR ')})`, tagParams);
    }

    const [items, total] = await qb
      .skip((Math.max(page, 1) - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string, userId: string): Promise<Vocabulary | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: ['categories'],
    });
  }

  async create(
    vocabularyData: Partial<Vocabulary> & { categoryIds?: string[] },
  ): Promise<Vocabulary> {
    return this.serializeIdentity(vocabularyData.userId!, async () => {
      const { categoryIds, ...data } = vocabularyData;
      data.partOfSpeech = data.partOfSpeech ?? PartOfSpeech.UNSPECIFIED;
      await assertVocabularyIdentity(this.repository, vocabularyData.userId!, {
        word: data.word ?? '',
        meaning: data.meaning,
        partOfSpeech: data.partOfSpeech,
      });

      // Get existing settings to apply to the new record
      const settings = await this.getSettings(vocabularyData.userId!);
      const vocabulary = this.repository.create({
        ...data,
        isAllTabHidden: settings.isAllTabHidden,
        activeTabId: settings.activeTabId,
      });

      if (categoryIds && categoryIds.length > 0) {
        const categories = await this.categoryRepository.find({
          where: { id: In(categoryIds), userId: vocabularyData.userId },
        });
        vocabulary.categories = categories;
      }

      return this.repository.save(vocabulary);
    });
  }

  async update(
    id: string,
    userId: string,
    vocabularyData: Partial<Vocabulary> & { categoryIds?: string[] },
  ): Promise<Vocabulary | null> {
    return this.serializeIdentity(userId, async () => {
      const { categoryIds, ...patch } = vocabularyData;
      // Transformed DTOs have own properties initialized to undefined, even
      // when those fields were not sent in the request. Keep only actual
      // changes so a note/background update retains the original identity.
      const data = Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ) as Partial<Vocabulary>;
      if (data.partOfSpeech == null) delete data.partOfSpeech;

      const vocabulary = await this.repository.findOne({
        where: { id, userId },
        relations: ['categories'],
      });

      if (!vocabulary) return null;

      await assertVocabularyIdentity(
        this.repository,
        userId,
        { ...vocabulary, ...data },
        vocabulary,
      );
      Object.assign(vocabulary, data);

      if (categoryIds !== undefined) {
        if (categoryIds.length > 0) {
          const categories = await this.categoryRepository.find({
            where: { id: In(categoryIds), userId },
          });
          vocabulary.categories = categories;
        } else {
          vocabulary.categories = [];
        }
      }

      return this.repository.save(vocabulary);
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    // The existing SQLite vocabulary-tab junction has a NO ACTION foreign key
    // for vocabulariesId. A plain repository.delete fails whenever a word
    // belongs to a tab. Remove only this user's word memberships first, in the
    // same transaction, then let SQLite cascade SRS and practice references.
    await this.repository.manager.transaction(async (manager) => {
      const word = await manager.findOne(Vocabulary, {
        where: { id, userId },
        select: { id: true },
      });
      if (!word) return;

      await manager.query(
        'DELETE FROM "vocabulary_tab_vocabularies_vocabularies" WHERE "vocabulariesId" = ? ' +
          'AND EXISTS (SELECT 1 FROM "vocabularies" WHERE "id" = ? AND "userId" = ?)',
        [id, id, userId],
      );
      await manager.delete(Vocabulary, { id, userId });
    });
  }

  async findByTags(userId: string, tags: string[]): Promise<Vocabulary[]> {
    const query = this.repository
      .createQueryBuilder('vocabulary')
      .where('vocabulary.userId = :userId', { userId });

    if (tags && tags.length > 0) {
      tags.forEach((tag, index) => {
        query.orWhere(`vocabulary.tags LIKE :tag${index}`, {
          [`tag${index}`]: `%${tag}%`,
        });
      });
    }

    return query.getMany();
  }

  async findForPractice(
    userId: string,
    limit: number = 10,
    tabId?: string,
  ): Promise<Vocabulary[]> {
    const query = this.repository
      .createQueryBuilder('vocabulary')
      .where('vocabulary.userId = :userId', { userId });

    if (tabId) {
      query.innerJoin(
        'vocabulary.tabs',
        'practiceTab',
        'practiceTab.id = :tabId AND practiceTab.userId = :userId',
        { tabId, userId },
      );
    }

    return query
      .orderBy('vocabulary.nextReviewAt', 'ASC')
      .addOrderBy('vocabulary.createdAt', 'ASC')
      .addOrderBy('vocabulary.id', 'ASC')
      .take(
        Math.max(
          1,
          Math.min(50, Number.isFinite(limit) ? Math.trunc(limit) : 10),
        ),
      )
      .getMany();
  }

  async updateMastery(
    id: string,
    userId: string,
    isCorrect: boolean,
  ): Promise<void> {
    const vocabulary = await this.findById(id, userId);
    if (!vocabulary) return;

    if (isCorrect) {
      vocabulary.correctCount += 1;
    } else {
      vocabulary.incorrectCount += 1;
    }

    vocabulary.lastReviewedAt = new Date();
    // Simple spaced repetition: next review in 1, 3, 7, 14 days based on correct count
    const daysToAdd = Math.min(Math.pow(2, vocabulary.correctCount), 30);
    vocabulary.nextReviewAt = new Date(
      Date.now() + daysToAdd * 24 * 60 * 60 * 1000,
    );

    await this.repository.save(vocabulary);
  }

  async toggleFavorite(id: string, userId: string): Promise<Vocabulary | null> {
    const vocabulary = await this.findById(id, userId);
    if (!vocabulary) return null;

    vocabulary.isFavorite = !vocabulary.isFavorite;
    return this.repository.save(vocabulary);
  }

  async togglePin(id: string, userId: string): Promise<Vocabulary | null> {
    const vocabulary = await this.findById(id, userId);
    if (!vocabulary) return null;

    vocabulary.isPinned = !vocabulary.isPinned;
    vocabulary.pinnedAt = vocabulary.isPinned ? new Date() : null;
    return this.repository.save(vocabulary);
  }

  async getFavorites(userId: string): Promise<Vocabulary[]> {
    return this.repository.find({
      where: { userId, isFavorite: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getFavoritesPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Vocabulary[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('vocabulary')
      .where('vocabulary.userId = :userId', { userId })
      .andWhere('vocabulary.isFavorite = true')
      .orderBy('vocabulary.createdAt', 'DESC');

    const [items, total] = await qb
      .skip((Math.max(page, 1) - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Load categories for returned items to keep parity with non-paginated result
    const ids = items.map((i) => i.id);
    if (ids.length > 0) {
      const withRelations = await this.repository.find({
        where: { id: In(ids) },
        relations: ['categories'],
      });
      // Preserve ordering
      const map = new Map(withRelations.map((v) => [v.id, v] as const));
      const ordered = items.map((i) => map.get(i.id) || i);
      return { items: ordered, total };
    }

    return { items, total };
  }

  async findByLearningDate(userId: string, tabId?: string): Promise<any> {
    const query = this.repository
      .createQueryBuilder('vocabulary')
      .leftJoinAndSelect('vocabulary.categories', 'categories')
      .where('vocabulary.userId = :userId', { userId });
    if (tabId) {
      query.innerJoin(
        'vocabulary.tabs',
        'practiceTab',
        'practiceTab.id = :tabId AND practiceTab.userId = :userId',
        { tabId, userId },
      );
    }
    const vocabularies = await query
      .orderBy('vocabulary.createdAt', 'DESC')
      .getMany();

    // Group by date (YYYY-MM-DD format)
    const groupedByDate = vocabularies.reduce(
      (acc, vocab) => {
        const dateKey = vocab.createdAt.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(vocab);
        return acc;
      },
      {} as Record<string, Vocabulary[]>,
    );

    // Convert to array format with date and vocabularies
    const result = Object.entries(groupedByDate)
      .map(([date, vocabs]) => ({
        date,
        count: vocabs.length,
        vocabularies: vocabs,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const topics = await this.topicRepository.find({ where: { userId } });
    const topicMap = new Map(topics.map((t) => [t.date, t]));

    return result.map((group) => {
      const topicData = topicMap.get(group.date);
      return {
        ...group,
        topic: topicData?.topic || '',
        icon: topicData?.icon || '',
        color: topicData?.color || '',
      };
    });
  }

  async updateTopic(
    userId: string,
    date: string,
    topic: string,
    icon?: string,
    color?: string,
  ): Promise<CategoryDateTopic> {
    let dateTopic = await this.topicRepository.findOne({
      where: { userId, date },
    });
    if (dateTopic) {
      dateTopic.topic = topic;
      if (icon !== undefined) dateTopic.icon = icon;
      if (color !== undefined) dateTopic.color = color;
    } else {
      dateTopic = this.topicRepository.create({
        userId,
        date,
        topic,
        icon,
        color,
      });
    }
    return this.topicRepository.save(dateTopic);
  }

  async moveByLearningDate(
    userId: string,
    fromDate: string,
    toDate: string,
    categoryId: string,
  ): Promise<void> {
    const vocabularies = await this.repository.find({
      where: { userId },
      relations: ['categories'],
      order: { createdAt: 'DESC' },
    });

    const fromKey = fromDate;
    const toCreatedAt = new Date(`${toDate}T00:00:00.000Z`);

    const toMove = vocabularies.filter((vocab) => {
      const vocabDateKey = vocab.createdAt.toISOString().split('T')[0];
      const hasCategory = vocab.categories?.some(
        (cat) => cat.id === categoryId,
      );
      return vocabDateKey === fromKey && hasCategory;
    });

    if (toMove.length === 0) {
      return;
    }

    toMove.forEach((vocab) => {
      vocab.createdAt = toCreatedAt;
    });

    await this.repository.save(toMove);
  }

  async updateFilterState(userId: string, isExpanded: boolean): Promise<void> {
    await this.repository.update({ userId }, { isFilterExpanded: isExpanded });
  }

  async updateAllTabHiddenState(
    userId: string,
    isHidden: boolean,
  ): Promise<void> {
    await this.repository.update({ userId }, { isAllTabHidden: isHidden });
  }

  async updateActiveTabState(
    userId: string,
    tabId: string | null,
  ): Promise<void> {
    await this.repository.update({ userId }, { activeTabId: tabId });
  }

  async getSettings(
    userId: string,
  ): Promise<{ isAllTabHidden: boolean; activeTabId: string | null }> {
    const vocabulary = await this.repository.findOne({
      where: { userId },
      select: ['isAllTabHidden', 'activeTabId'],
    });

    return {
      isAllTabHidden: vocabulary?.isAllTabHidden ?? false,
      activeTabId: vocabulary?.activeTabId ?? null,
    };
  }
}
