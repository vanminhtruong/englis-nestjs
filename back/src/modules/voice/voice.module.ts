import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voice } from '../../entities/voice.entity';
import { VoiceRepository } from './repositories/voice.repository';
import { VoiceCrudService } from './services/voice-crud.service';
import { VoiceService } from './services/voice.service';
import { VoiceController } from './voice.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voice]), AuthModule],
  controllers: [VoiceController],
  providers: [VoiceRepository, VoiceCrudService, VoiceService],
  exports: [VoiceService],
})
export class VoiceModule { }


