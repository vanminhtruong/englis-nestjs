import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeHistory } from '../../../entities/practice-history.entity';

@Injectable()
export class PracticeHistoryRepository {
  constructor(
    @InjectRepository(PracticeHistory)
    private readonly repository: Repository<PracticeHistory>,
  ) {}

  async create(historyData: Partial<PracticeHistory>): Promise<PracticeHistory> {
    const history = this.repository.create(historyData);
    return this.repository.save(history);
  }

  async findByUser(userId: string): Promise<PracticeHistory[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['vocabulary'],
    });
  }

  async getStatistics(userId: string) {
    const histories = await this.repository.find({ where: { userId } });
    
    const totalPractices = histories.length;
    const correctAnswers = histories.filter(h => h.isCorrect).length;
    const totalScore = histories.reduce((sum, h) => sum + h.score, 0);
    const totalTimeSpent = histories.reduce((sum, h) => sum + h.timeSpent, 0);

    return {
      totalPractices,
      correctAnswers,
      incorrectAnswers: totalPractices - correctAnswers,
      accuracy: totalPractices > 0 ? (correctAnswers / totalPractices) * 100 : 0,
      totalScore,
      totalTimeSpent,
      averageTimePerPractice: totalPractices > 0 ? totalTimeSpent / totalPractices : 0,
    };
  }
}
