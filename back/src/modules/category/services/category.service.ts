import { Injectable } from '@nestjs/common';
import { CategoryCrudService } from './category-crud.service';
import { BulkCategoryDto } from '../dto/bulk-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly crudService: CategoryCrudService) {}

  async findAll(userId: string) {
    return this.crudService.findAll(userId);
  }

  async findPage(userId: string, query: QueryCategoryDto) {
    return this.crudService.findPage(userId, query);
  }

  async bulk(userId: string, dto: BulkCategoryDto) {
    return this.crudService.bulk(userId, dto);
  }

  async findById(id: string, userId: string) {
    return this.crudService.findById(id, userId);
  }

  async create(userId: string, createDto: CreateCategoryDto) {
    return this.crudService.create(userId, createDto);
  }

  async update(id: string, userId: string, updateDto: UpdateCategoryDto) {
    return this.crudService.update(id, userId, updateDto);
  }

  async delete(id: string, userId: string) {
    return this.crudService.delete(id, userId);
  }

  async togglePin(id: string, userId: string) {
    return this.crudService.togglePin(id, userId);
  }

  async getCategoryWithVocabularies(categoryId: string, userId: string) {
    return this.crudService.getCategoryWithVocabularies(categoryId, userId);
  }
}
