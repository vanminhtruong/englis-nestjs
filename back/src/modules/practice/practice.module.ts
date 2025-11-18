import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeHistory } from '../../entities/practice-history.entity';
import { PracticeMode } from '../../entities/practice-mode.entity';
import { PracticeController } from './practice.controller';
import { PracticeModeController } from './practice-mode.controller';
import { PracticeService } from './services/practice.service';
import { PracticeModeService } from './services/practice-mode.service';
import { PracticeHistoryRepository } from './repositories/practice-history.repository';
import { PracticeModeRepository } from './repositories/practice-mode.repository';
import { VocabularyModule } from '../vocabulary/vocabulary.module';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PracticeHistory, PracticeMode]),
    VocabularyModule,
    AuthModule,
    WebsocketModule,
    forwardRef(() => HistoryModule),
  ],
  controllers: [PracticeController, PracticeModeController],
  providers: [PracticeService, PracticeModeService, PracticeHistoryRepository, PracticeModeRepository],
  exports: [PracticeService, PracticeModeService],
})
export class PracticeModule {}
