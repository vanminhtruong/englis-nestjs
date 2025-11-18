import { Injectable } from '@nestjs/common';
import { PracticeModeRepository } from '../repositories/practice-mode.repository';
import { PracticeMode } from '../../../entities/practice-mode.entity';

@Injectable()
export class PracticeModeService {
  constructor(
    private readonly practiceModeRepository: PracticeModeRepository,
  ) {}

  async getAllActiveModes(): Promise<PracticeMode[]> {
    return this.practiceModeRepository.findAllActive();
  }

  async getModeByKey(key: string): Promise<PracticeMode | null> {
    return this.practiceModeRepository.findByKey(key);
  }

  async createMode(data: Partial<PracticeMode>): Promise<PracticeMode> {
    return this.practiceModeRepository.create(data);
  }

  async updateMode(id: string, data: Partial<PracticeMode>): Promise<PracticeMode | null> {
    return this.practiceModeRepository.update(id, data);
  }

  async deleteMode(id: string): Promise<void> {
    return this.practiceModeRepository.delete(id);
  }
}
