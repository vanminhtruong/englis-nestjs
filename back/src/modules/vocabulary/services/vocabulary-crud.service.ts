import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { VocabularyRepository } from '../repositories/vocabulary.repository';
import { CreateVocabularyDto } from '../dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from '../dto/update-vocabulary.dto';
import { HistoryService } from '../../history/services/history.service';
import { HistoryAction } from '../../../entities/history.entity';
import { UserRepository } from '../../auth/repositories/user.repository';

@Injectable()
export class VocabularyCrudService {
  constructor(
    private readonly vocabularyRepository: VocabularyRepository,
    @Inject(forwardRef(() => HistoryService))
    private readonly historyService: HistoryService,
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(userId: string) {
    return this.vocabularyRepository.findAll(userId);
  }

  async findById(id: string, userId: string) {
    return this.vocabularyRepository.findById(id, userId);
  }

  async create(userId: string, createDto: CreateVocabularyDto) {
    const vocabulary = await this.vocabularyRepository.create({
      ...createDto,
      userId,
    });

    // Increment user's total words count
    await this.userRepository.incrementTotalWords(userId);

    // Log history
    await this.historyService.create({
      userId,
      vocabularyId: vocabulary.id,
      action: HistoryAction.VOCABULARY_CREATED,
      metadata: {
        word: vocabulary.word,
        translation: vocabulary.meaning,
      },
      description: `Created vocabulary: ${vocabulary.word}`,
    });

    return vocabulary;
  }

  async update(id: string, userId: string, updateDto: UpdateVocabularyDto) {
    const oldVocab = await this.vocabularyRepository.findById(id, userId);
    const vocabulary = await this.vocabularyRepository.update(
      id,
      userId,
      updateDto,
    );

    // Log history
    if (vocabulary) {
      await this.historyService.create({
        userId,
        vocabularyId: vocabulary.id,
        action: HistoryAction.VOCABULARY_UPDATED,
        metadata: {
          oldWord: oldVocab?.word,
          newWord: vocabulary.word,
          oldTranslation: oldVocab?.meaning,
          newTranslation: vocabulary.meaning,
        },
        description: `Updated vocabulary: ${vocabulary.word}`,
      });
    }

    return vocabulary;
  }

  async delete(id: string, userId: string) {
    const vocabulary = await this.vocabularyRepository.findById(id, userId);

    // Log history TRƯỚC KHI delete để tránh foreign key constraint
    if (vocabulary) {
      await this.historyService.create({
        userId,
        vocabularyId: id,
        action: HistoryAction.VOCABULARY_DELETED,
        metadata: {
          word: vocabulary.word,
          translation: vocabulary.meaning,
        },
        description: `Deleted vocabulary: ${vocabulary.word}`,
      });
    }

    // Delete vocabulary sau khi đã log history
    await this.vocabularyRepository.delete(id, userId);

    // Decrement user's total words count if vocabulary existed
    if (vocabulary) {
      await this.userRepository.decrementTotalWords(userId);
    }
  }

  async toggleFavorite(id: string, userId: string) {
    return this.vocabularyRepository.toggleFavorite(id, userId);
  }

  async getFavorites(userId: string) {
    return this.vocabularyRepository.getFavorites(userId);
  }

  async togglePin(id: string, userId: string) {
    return this.vocabularyRepository.togglePin(id, userId);
  }
}
