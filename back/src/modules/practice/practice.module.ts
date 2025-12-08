import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeHistory } from '../../entities/practice-history.entity';
import { PracticeController } from './practice.controller';
import { PracticeService } from './services/practice.service';
import { PracticeHistoryRepository } from './repositories/practice-history.repository';
import { VocabularyModule } from '../vocabulary/vocabulary.module';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PracticeHistory]),
    VocabularyModule,
    AuthModule,
    WebsocketModule,
    forwardRef(() => HistoryModule),
  ],
  controllers: [PracticeController],
  providers: [PracticeService, PracticeHistoryRepository],
  exports: [PracticeService],
})
export class PracticeModule { }

