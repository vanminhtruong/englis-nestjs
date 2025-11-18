import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './services/category.service';
import { CategoryCrudService } from './services/category-crud.service';
import { CategoryRepository } from './repositories/category.repository';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), WebsocketModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryCrudService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
