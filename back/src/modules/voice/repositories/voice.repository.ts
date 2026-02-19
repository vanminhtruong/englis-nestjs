import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voice } from '../../../entities/voice.entity';

@Injectable()
export class VoiceRepository {
  constructor(
    @InjectRepository(Voice)
    private readonly repo: Repository<Voice>,
  ) { }

  findAllActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findByKey(key: string) {
    return this.repo.findOne({ where: { key } });
  }

  async setPreferred(key: string) {
    // Reset all to false
    await this.repo.createQueryBuilder()
      .update(Voice)
      .set({ isPreferred: false })
      .execute();

    // Set selected to true
    await this.repo.update({ key }, { isPreferred: true });
  }

  async upsertMany(voices: Partial<Voice>[]) {
    for (const v of voices) {
      if (!v.key) continue;
      const existing = await this.findByKey(v.key);
      if (existing) {
        await this.repo.update(existing.id, v);
      } else {
        await this.repo.save(this.repo.create(v));
      }
    }
  }
}


