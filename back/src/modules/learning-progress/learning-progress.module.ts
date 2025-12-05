import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningProgressController } from './learning-progress.controller';
import { LearningProgressService } from './services/learning-progress.service';
import { LearningProgressRepository } from './repositories/learning-progress.repository';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { History } from '../../entities/history.entity';
import { User } from '../../entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vocabulary, History, User])],
    controllers: [LearningProgressController],
    providers: [LearningProgressService, LearningProgressRepository],
    exports: [LearningProgressService],
})
export class LearningProgressModule { }
