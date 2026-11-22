import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyTabService } from './vocabulary-tab.service';
import { VocabularyTabController } from './vocabulary-tab.controller';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { UploadService } from '../../common/services/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([VocabularyTab, Vocabulary])],
  controllers: [VocabularyTabController],
  providers: [VocabularyTabService, UploadService],
})
export class VocabularyTabModule {}
