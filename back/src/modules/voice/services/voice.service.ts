import { Injectable } from '@nestjs/common';
import { VoiceCrudService } from './voice-crud.service';
import { Voice } from '../../../entities/voice.entity';
import { UserRepository } from '../../auth/repositories/user.repository';

@Injectable()
export class VoiceService {
  constructor(
    private readonly voiceCrudService: VoiceCrudService,
    private readonly userRepository: UserRepository,
  ) {}

  getAllActive(): Promise<Voice[]> {
    return this.voiceCrudService.getAllActive();
  }

  async setPreferredVoice(userId: string, voiceKey: string) {
    const updatedUser = await this.userRepository.update(userId, {
      preferredVoiceKey: voiceKey,
    });

    return {
      id: updatedUser?.id,
      preferredVoiceKey: updatedUser?.preferredVoiceKey ?? null,
    };
  }
}


