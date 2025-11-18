import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeMode } from '../../../entities/practice-mode.entity';

@Injectable()
export class PracticeModeRepository {
  constructor(
    @InjectRepository(PracticeMode)
    private readonly repository: Repository<PracticeMode>,
  ) {}

  async findAllActive(): Promise<PracticeMode[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByKey(key: string): Promise<PracticeMode | null> {
    return this.repository.findOne({
      where: { key },
    });
  }

  async create(data: Partial<PracticeMode>): Promise<PracticeMode> {
    const practiceMode = this.repository.create(data);
    return this.repository.save(practiceMode);
  }

  async update(id: string, data: Partial<PracticeMode>): Promise<PracticeMode | null> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }
}
