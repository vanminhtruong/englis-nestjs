import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from '../../../entities/category.entity';
import { BulkCategoryDto } from '../dto/bulk-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CATEGORY_PAGE_SIZE, QueryCategoryDto } from '../dto/query-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { joinCategorySmartStats, smartWordCount, smartRecentCount, smartIdleDays, smartLastStudy, smartInterested, smartNeglected } from './category-smart-query';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.repository.find({
      where: { userId },
      relations: ['vocabularies'],
      order: { isPinned: 'DESC', pinnedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  /** List only card fields and counts, not the full vocabulary collection. */
  async findPage(userId: string, options: QueryCategoryDto, now = new Date()) {
    const qb = this.repository.createQueryBuilder('c').where('c.userId = :userId', { userId });
    joinCategorySmartStats(qb, now);
    const wordCount = smartWordCount;
    const summaryQuery = qb.clone().select('COUNT(*)', 'totalCategories')
      .addSelect('COALESCE(SUM(CASE WHEN ' + smartInterested + ' THEN 1 ELSE 0 END), 0)', 'interested')
      .addSelect('COALESCE(SUM(CASE WHEN ' + smartNeglected + ' THEN 1 ELSE 0 END), 0)', 'neglected');
    const tokens = (options.search || '').trim().split(/\s+/).filter(Boolean);
    tokens.forEach((token, index) => {
      const param = 'term' + index;
      const match = (field: string) => "COALESCE(" + field + ", '') LIKE :" + param + " ESCAPE '!'";
      const conditions: string[] = [];
      const scope = options.scope || 'all';
      if (scope === 'all' || scope === 'name') conditions.push(match('c.name'));
      if (scope === 'all' || scope === 'description') conditions.push(match('c.description'));
      if (scope === 'all' || scope === 'vocabulary') {
        conditions.push('EXISTS (SELECT 1 FROM vocabulary_categories vc INNER JOIN vocabularies v ON v.id = vc.vocabularyId WHERE vc.categoryId = c.id AND v.userId = :userId AND (' + match('v.word') + ' OR ' + match('v.meaning') + '))');
      }
      qb.andWhere('(' + conditions.join(' OR ') + ')', { [param]: '%' + token.replace(/[!%_]/g, ch => '!' + ch) + '%' });
    });
    if (options.pinned === 'pinned') qb.andWhere('c.isPinned = :pinned', { pinned: true });
    if (options.pinned === 'unpinned') qb.andWhere('c.isPinned = :pinned', { pinned: false });
    if (options.content === 'empty') qb.andWhere(wordCount + ' = 0');
    if (options.content === 'populated') qb.andWhere(wordCount + ' > 0');
    if (options.iconType === 'custom') qb.andWhere("c.icon LIKE 'data:image/%'");
    if (options.iconType === 'preset') qb.andWhere("(c.icon IS NULL OR c.icon NOT LIKE 'data:image/%')");
    if (options.color) qb.andWhere('LOWER(c.color) = LOWER(:color)', { color: options.color });

    if (options.smart === 'interested') qb.andWhere(smartInterested);
    if (options.smart === 'neglected') qb.andWhere(smartNeglected);
    if (options.smart === 'recommended') qb.andWhere('(' + smartInterested + ' OR ' + smartNeglected + ')');

    const [total, summary] = await Promise.all([
      qb.getCount(),
      summaryQuery.getRawOne(),
    ]);
    const totalCategories = Number(summary?.totalCategories || 0);
    const interested = Number(summary?.interested || 0);
    const neglected = Number(summary?.neglected || 0);
    const smartSummary = { interested, neglected, recommended: interested + neglected };
    const pageCount = Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE));
    const page = Math.min(Math.max(1, options.page || 1), pageCount);
    const fields = ['id', 'name', 'description', 'color', 'icon', 'isPinned', 'pinnedAt', 'createdAt', 'updatedAt'] as const;
    qb.select(fields.map(field => 'c.' + field + ' AS "' + field + '"'))
      .addSelect(wordCount, 'vocabularyCount')
      .addSelect(smartRecentCount, 'recentActivityCount')
      .addSelect(smartIdleDays, 'idleDays')
      .addSelect(smartLastStudy, 'lastStudyJulian')
      .addSelect('CASE WHEN ' + smartNeglected + ' THEN 1 ELSE 0 END', 'needsReview')
      .addSelect('CASE WHEN ' + smartInterested + ' THEN 1 ELSE 0 END', 'isInterested');
    // Smart modes choose their own relevance ordering only when the normal sort is default.
    if (!options.sort || options.sort === 'default') {
      if (options.smart === 'interested') qb.orderBy('recentActivityCount', 'DESC').addOrderBy('lastStudyJulian', 'DESC');
      else if (options.smart === 'neglected') qb.orderBy('idleDays', 'DESC');
      else if (options.smart === 'recommended') qb.orderBy('needsReview', 'DESC').addOrderBy('CASE WHEN ' + smartNeglected + ' THEN ' + smartIdleDays + ' ELSE ' + smartRecentCount + ' END', 'DESC');
      else qb.orderBy('c.isPinned', 'DESC').addOrderBy('c.pinnedAt', 'DESC').addOrderBy('c.createdAt', 'DESC');
    }
    switch (options.sort) {
      case 'newest': qb.orderBy('c.createdAt', 'DESC'); break;
      case 'oldest': qb.orderBy('c.createdAt', 'ASC'); break;
      case 'nameAsc': qb.orderBy('c.name COLLATE NOCASE', 'ASC'); break;
      case 'nameDesc': qb.orderBy('c.name COLLATE NOCASE', 'DESC'); break;
      case 'mostWords': qb.orderBy('vocabularyCount', 'DESC').addOrderBy('c.name COLLATE NOCASE', 'ASC'); break;
      case 'fewestWords': qb.orderBy('vocabularyCount', 'ASC').addOrderBy('c.name COLLATE NOCASE', 'ASC'); break;
      case 'updated': qb.orderBy('c.updatedAt', 'DESC'); break;
      default: break;
    }
    const rows = await qb.addOrderBy('c.id', 'ASC').offset((page - 1) * CATEGORY_PAGE_SIZE).limit(CATEGORY_PAGE_SIZE).getRawMany();
    const data = rows.map(({ lastStudyJulian, recentActivityCount, idleDays, needsReview, isInterested, ...row }) => ({ ...row, isPinned: !!row.isPinned, vocabularyCount: Number(row.vocabularyCount), smart: { recentActivityCount: Number(recentActivityCount), idleDays: Number(idleDays), hasStudied: lastStudyJulian != null, needsReview: !!needsReview, isInterested: !!isInterested } }));
    return { data, total, totalCategories, page, pageCount, limit: CATEGORY_PAGE_SIZE, smartSummary };
  }
  async bulk(userId: string, dto: BulkCategoryDto) {
    const ids = [...new Set(dto.ids)];
    return this.repository.manager.transaction(async manager => {
      const repository = manager.getRepository(Category);
      const rows = await repository.find({
        where: { userId, id: In(ids) },
        select: { id: true, isPinned: true },
      });
      const processedIds = rows.map(row => row.id);
      const owned = new Set(processedIds);
      const failedIds = ids.filter(id => !owned.has(id));
      if (!processedIds.length) return { processedIds, failedIds };
      if (dto.action === 'delete') {
        // Explicitly detach vocabulary relations before deleting the owned categories.
        await manager.createQueryBuilder().delete().from('vocabulary_categories').where('categoryId IN (:...ids)', { ids: processedIds }).execute();
        await repository.delete({ userId, id: In(processedIds) });
      } else {
        const pinned = dto.action === 'pin';
        const changed = rows.filter(row => row.isPinned !== pinned).map(row => row.id);
        if (changed.length) {
          await repository.update({ userId, id: In(changed) }, {
            isPinned: pinned, pinnedAt: pinned ? new Date() : null,
          });
        }
      }
      return { processedIds, failedIds };
    });
  }
  async findById(id: string, userId: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: ['vocabularies'],
    });
  }

  async create(
    userId: string,
    createDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = this.repository.create({
      ...createDto,
      userId,
    });
    return this.repository.save(category);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const category = await this.findById(id, userId);
    if (!category) return null;

    Object.assign(category, updateDto);
    return this.repository.save(category);
  }

  async togglePin(
    id: string,
    userId: string,
  ): Promise<Category | null> {
    const category = await this.findById(id, userId);
    if (!category) return null;

    category.isPinned = !category.isPinned;
    category.pinnedAt = category.isPinned ? new Date() : null;
    return this.repository.save(category);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.bulk(userId, { action: 'delete', ids: [id] });
  }

  async getCategoryWithVocabularies(
    categoryId: string,
    userId: string,
  ): Promise<Category | null> {
    return this.repository.findOne({
      where: { id: categoryId, userId },
      relations: ['vocabularies'],
      order: { vocabularies: { createdAt: 'DESC' } },
    });
  }
}
