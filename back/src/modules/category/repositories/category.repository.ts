import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.repository.find({
      where: { userId },
      relations: ['vocabularies'],
      order: { isPinned: 'DESC', pinnedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { id, userId },
      relations: ['vocabularies'],
    });
  }

  async create(
    userId: string,
    createDto: CreateCategoryDto,
  ): Promise<Category> {
    const category = this.repository.create({
      ...createDto,
      userId,
    });
    return this.repository.save(category);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const category = await this.findById(id, userId);
    if (!category) return null;

    Object.assign(category, updateDto);
    return this.repository.save(category);
  }

  async togglePin(
    id: string,
    userId: string,
  ): Promise<Category | null> {
    const category = await this.findById(id, userId);
    if (!category) return null;

    category.isPinned = !category.isPinned;
    category.pinnedAt = category.isPinned ? new Date() : null;
    return this.repository.save(category);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.repository.delete({ id, userId });
  }

  async getCategoryWithVocabularies(
    categoryId: string,
    userId: string,
  ): Promise<Category | null> {
    return this.repository.findOne({
      where: { id: categoryId, userId },
      relations: ['vocabularies'],
      order: { vocabularies: { createdAt: 'DESC' } },
    });
  }
}
