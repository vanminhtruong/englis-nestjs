import { Injectable } from '@nestjs/common';
import { Voice } from '../../../entities/voice.entity';
import { VoiceRepository } from '../repositories/voice.repository';

@Injectable()
export class VoiceCrudService {
  constructor(private readonly voiceRepository: VoiceRepository) {}

  getAllActive(): Promise<Voice[]> {
    return this.voiceRepository.findAllActive();
  }

  upsertMany(voices: Partial<Voice>[]) {
    return this.voiceRepository.upsertMany(voices);
  }
}


