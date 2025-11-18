import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryCrudService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(userId: string) {
    return this.categoryRepository.findAll(userId);
  }

  async findById(id: string, userId: string) {
    return this.categoryRepository.findById(id, userId);
  }

  async create(userId: string, createDto: CreateCategoryDto) {
    return this.categoryRepository.create(userId, createDto);
  }

  async update(id: string, userId: string, updateDto: UpdateCategoryDto) {
    return this.categoryRepository.update(id, userId, updateDto);
  }

  async delete(id: string, userId: string) {
    return this.categoryRepository.delete(id, userId);
  }

  async togglePin(id: string, userId: string) {
    return this.categoryRepository.togglePin(id, userId);
  }

  async getCategoryWithVocabularies(categoryId: string, userId: string) {
    return this.categoryRepository.getCategoryWithVocabularies(
      categoryId,
      userId,
    );
  }
}
