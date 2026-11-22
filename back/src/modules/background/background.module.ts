import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Background } from '../../entities/background.entity';
import { BackgroundCategory } from '../../entities/background-category.entity';
import { UserBackground } from '../../entities/user-background.entity';
import { UploadService } from '../../common/services/upload.service';
import { UserBackgroundService } from './services/user-background.service';
import { BackgroundRepository } from './repositories/background.repository';
import { BackgroundCategoryRepository } from './repositories/background-category.repository';
import { BackgroundService } from './services/background.service';
import { BackgroundController } from './controllers/background.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Background, BackgroundCategory, UserBackground]),
  ],
  controllers: [BackgroundController],
  providers: [
    BackgroundRepository,
    BackgroundCategoryRepository,
    BackgroundService,
    UserBackgroundService,
    UploadService,
  ],
  exports: [BackgroundService],
})
export class BackgroundModule {}
