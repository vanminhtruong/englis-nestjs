import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { Category } from '../../entities/category.entity';
import { CategoryDateTopic } from '../../entities/category-date-topic.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './services/vocabulary.service';
import { VocabularyCrudService } from './services/vocabulary-crud.service';
import { VocabularySearchService } from './services/vocabulary-search.service';
import { VocabularyRepository } from './repositories/vocabulary.repository';
import { UserRepository } from '../auth/repositories/user.repository';
import { AuthModule } from '../auth/auth.module';
import { UploadService } from '../../common/services/upload.service';
import { HistoryModule } from '../history/history.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, Category, CategoryDateTopic]),
    AuthModule,
    forwardRef(() => HistoryModule),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [VocabularyController],
  providers: [
    VocabularyService,
    VocabularyCrudService,
    VocabularySearchService,
    VocabularyRepository,
    UploadService,
  ],
  exports: [VocabularyService, VocabularyRepository],
})
export class VocabularyModule { }
