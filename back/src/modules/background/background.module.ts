import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Background } from '../../entities/background.entity';
import { BackgroundCategory } from '../../entities/background-category.entity';
import { BackgroundRepository } from './repositories/background.repository';
import { BackgroundCategoryRepository } from './repositories/background-category.repository';
import { BackgroundService } from './services/background.service';
import { BackgroundController } from './controllers/background.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Background, BackgroundCategory])],
    controllers: [BackgroundController],
    providers: [BackgroundRepository, BackgroundCategoryRepository, BackgroundService],
    exports: [BackgroundService],
})
export class BackgroundModule { }

