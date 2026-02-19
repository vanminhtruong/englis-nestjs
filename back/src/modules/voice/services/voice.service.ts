import { Injectable } from '@nestjs/common';
import { VoiceCrudService } from './voice-crud.service';
import { Voice } from '../../../entities/voice.entity';
import { VoiceRepository } from '../repositories/voice.repository';
import { UserRepository } from '../../auth/repositories/user.repository';

@Injectable()
export class VoiceService {
  constructor(
    private readonly voiceCrudService: VoiceCrudService,
    private readonly voiceRepository: VoiceRepository,
    private readonly userRepository: UserRepository,
  ) { }

  getAllActive(): Promise<Voice[]> {
    return this.voiceCrudService.getAllActive();
  }

  async setPreferredVoice(userId: string, voiceKey: string) {
    // Lưu preferredVoiceKey vào user record (per-user)
    await this.userRepository.update(userId, { preferredVoiceKey: voiceKey });
    return { success: true };
  }
}


