import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async incrementTotalWords(id: string): Promise<void> {
    await this.repository.increment({ id }, 'totalWords', 1);
  }

  async decrementTotalWords(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'totalWords', 1);
  }

  async recalculateTotalWords(id: string): Promise<void> {
    const vocabularyCount = await this.repository
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('vocabularies', 'vocabulary')
      .where('vocabulary.userId = :userId', { userId: id })
      .getRawOne();
    
    const totalWords = parseInt(vocabularyCount.count) || 0;
    
    await this.repository.update(id, { totalWords });
  }
}
