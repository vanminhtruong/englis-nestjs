import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from '../../entities/history.entity';
import { HistoryController } from './history.controller';
import { HistoryService } from './services/history.service';
import { HistoryRepository } from './repositories/history.repository';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([History]),
    AuthModule,
    WebsocketModule,
  ],
  controllers: [HistoryController],
  providers: [HistoryService, HistoryRepository],
  exports: [HistoryService],
})
export class HistoryModule {}
