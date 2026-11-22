import { Injectable } from '@nestjs/common';
import { VocabularyRepository } from '../repositories/vocabulary.repository';

@Injectable()
export class VocabularySearchService {
  constructor(private readonly vocabularyRepository: VocabularyRepository) {}

  async findByTags(userId: string, tags: string[]) {
    return this.vocabularyRepository.findByTags(userId, tags);
  }

  async findForPractice(userId: string, limit: number = 10, tabId?: string) {
    return this.vocabularyRepository.findForPractice(userId, limit, tabId);
  }

  async findByLearningDate(userId: string, tabId?: string) {
    return this.vocabularyRepository.findByLearningDate(userId, tabId);
  }
}
