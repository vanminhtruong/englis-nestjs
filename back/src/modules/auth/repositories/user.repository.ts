import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = (email ?? '').trim().toLowerCase();
    if (!normalized) return null;
    // Email addresses are not case sensitive: "Minh@Gmail.com" is the same account.
    return this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalized })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['vocabularies', 'practiceHistories', 'practiceHistories.vocabulary'],
    });
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
    // Count only this user's rows. The previous query also selected from the
    // users table, so the result was multiplied by the number of registered users.
    const rows: Array<{ count: number | string }> = await this.repository.manager.query(
      'SELECT COUNT(*) AS count FROM vocabularies WHERE userId = ?',
      [id],
    );
    const totalWords = parseInt(String(rows[0]?.count ?? 0), 10) || 0;

    await this.repository.update(id, { totalWords });
  }
}
