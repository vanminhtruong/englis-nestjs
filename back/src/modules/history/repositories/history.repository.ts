import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from '../../../entities/history.entity';
import { CreateHistoryDto } from '../dto/create-history.dto';

@Injectable()
export class HistoryRepository {
  constructor(
    @InjectRepository(History)
    private readonly repository: Repository<History>,
  ) {}

  async create(createHistoryDto: CreateHistoryDto): Promise<History> {
    const history = this.repository.create(createHistoryDto);
    return this.repository.save(history);
  }

  async findByUser(userId: string): Promise<History[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['vocabulary', 'user'],
      take: 100, // Limit to latest 100 records (legacy)
    });
  }

  async findByUserPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: History[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.vocabulary', 'vocabulary')
      .leftJoinAndSelect('history.user', 'user')
      .where('history.userId = :userId', { userId })
      .orderBy('history.createdAt', 'DESC')
      .skip((Math.max(page, 1) - 1) * limit)
      .take(limit)

    const [items, total] = await qb.getManyAndCount()
    return { items, total }
  }

  async getStatistics(userId: string) {
    const histories = await this.repository.find({
      where: { userId },
    });

    // Count actions
    const vocabularyCreated = histories.filter(
      (h) => h.action === 'vocabulary_created',
    ).length;
    const vocabularyUpdated = histories.filter(
      (h) => h.action === 'vocabulary_updated',
    ).length;
    const vocabularyDeleted = histories.filter(
      (h) => h.action === 'vocabulary_deleted',
    ).length;

    // Practice statistics
    const practiceActions = histories.filter((h) =>
      h.action.startsWith('practice_'),
    );
    const totalPractices = practiceActions.length;
    const correctAnswers = practiceActions.filter(
      (h) => h.metadata?.isCorrect === true,
    ).length;
    const totalScore = practiceActions.reduce(
      (sum, h) => sum + (h.metadata?.score || 0),
      0,
    );
    const totalTimeSpent = practiceActions.reduce(
      (sum, h) => sum + (h.metadata?.timeSpent || 0),
      0,
    );

    return {
      vocabulary: {
        created: vocabularyCreated,
        updated: vocabularyUpdated,
        deleted: vocabularyDeleted,
        total: vocabularyCreated + vocabularyUpdated + vocabularyDeleted,
      },
      practice: {
        totalPractices,
        correctAnswers,
        incorrectAnswers: totalPractices - correctAnswers,
        accuracy:
          totalPractices > 0 ? (correctAnswers / totalPractices) * 100 : 0,
        totalScore,
        totalTimeSpent,
        averageTimePerPractice:
          totalPractices > 0 ? totalTimeSpent / totalPractices : 0,
      },
      totalActivities: histories.length,
    };
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.repository.delete({ id, userId });
  }
}
