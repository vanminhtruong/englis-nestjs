import { Injectable } from '@nestjs/common';
import { VocabularyCrudService } from './vocabulary-crud.service';
import { VocabularySearchService } from './vocabulary-search.service';
import { CreateVocabularyDto } from '../dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from '../dto/update-vocabulary.dto';
import { VocabularyRepository } from '../repositories/vocabulary.repository';
import { MoveVocabularyByDateDto } from '../dto/move-vocabulary-by-date.dto';

@Injectable()
export class VocabularyService {
  constructor(
    private readonly crudService: VocabularyCrudService,
    private readonly searchService: VocabularySearchService,
    private readonly vocabularyRepository: VocabularyRepository,
  ) { }

  async findAll(userId: string) {
    return this.crudService.findAll(userId);
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
  ) {
    return this.vocabularyRepository.findAllPaginated(
      userId,
      page,
      limit,
      search,
      difficulty,
      tabId,
      categoryIds,
      tags,
    );
  }

  async findById(id: string, userId: string) {
    return this.crudService.findById(id, userId);
  }

  async create(userId: string, createDto: CreateVocabularyDto) {
    return this.crudService.create(userId, createDto);
  }

  async update(id: string, userId: string, updateDto: UpdateVocabularyDto) {
    return this.crudService.update(id, userId, updateDto);
  }

  async delete(id: string, userId: string) {
    return this.crudService.delete(id, userId);
  }

  async findByTags(userId: string, tags: string[]) {
    return this.searchService.findByTags(userId, tags);
  }

  async findForPractice(userId: string, limit: number = 10) {
    return this.searchService.findForPractice(userId, limit);
  }

  async toggleFavorite(id: string, userId: string) {
    return this.crudService.toggleFavorite(id, userId);
  }

  async getFavorites(userId: string) {
    return this.crudService.getFavorites(userId);
  }

  async togglePin(id: string, userId: string) {
    return this.crudService.togglePin(id, userId);
  }

  async getFavoritesPaginated(userId: string, page: number, limit: number) {
    return this.vocabularyRepository.getFavoritesPaginated(userId, page, limit);
  }

  async findByLearningDate(userId: string) {
    return this.searchService.findByLearningDate(userId);
  }

  async moveByLearningDate(userId: string, dto: MoveVocabularyByDateDto) {
    const { fromDate, toDate, categoryId } = dto;
    await this.vocabularyRepository.moveByLearningDate(
      userId,
      fromDate,
      toDate,
      categoryId,
    );
  }

  async updateTopic(userId: string, date: string, topic: string, icon?: string, color?: string) {
    return this.vocabularyRepository.updateTopic(userId, date, topic, icon, color);
  }

  async updateFilterState(userId: string, isExpanded: boolean) {
    return this.vocabularyRepository.updateFilterState(userId, isExpanded);
  }

  async updateAllTabHiddenState(userId: string, isHidden: boolean) {
    return this.vocabularyRepository.updateAllTabHiddenState(userId, isHidden);
  }
}
