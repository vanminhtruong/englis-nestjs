import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { SrsProgress } from '../../entities/srs-progress.entity';
import { SrsReview } from '../../entities/srs-review.entity';
import { AuthModule } from '../auth/auth.module';
import { SrsController } from './srs.controller';
import { SrsService } from './srs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, SrsProgress, SrsReview]),
    AuthModule,
  ],
  controllers: [SrsController],
  providers: [SrsService],
})
export class SrsModule {}
