import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataShare } from '../../entities/data-share.entity';
import { User } from '../../entities/user.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { PracticeHistory } from '../../entities/practice-history.entity';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { DataShareController } from './data-share.controller';
import { DataShareService } from './services/data-share.service';
import { DataShareMailService } from './services/data-share-mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataShare, User, Vocabulary, PracticeHistory]),
    AuthModule,
    WebsocketModule,
  ],
  controllers: [DataShareController],
  providers: [DataShareService, DataShareMailService],
})
export class DataShareModule {}
