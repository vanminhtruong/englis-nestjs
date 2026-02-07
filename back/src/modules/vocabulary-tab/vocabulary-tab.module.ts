import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyTabService } from './vocabulary-tab.service';
import { VocabularyTabController } from './vocabulary-tab.controller';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';

@Module({
    imports: [TypeOrmModule.forFeature([VocabularyTab, Vocabulary])],
    controllers: [VocabularyTabController],
    providers: [VocabularyTabService],
})
export class VocabularyTabModule { }
