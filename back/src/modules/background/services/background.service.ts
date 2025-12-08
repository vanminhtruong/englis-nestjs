import { Injectable } from '@nestjs/common';
import { BackgroundRepository } from '../repositories/background.repository';
import { BackgroundCategoryRepository } from '../repositories/background-category.repository';
import { Background } from '../../../entities/background.entity';
import { BackgroundCategory } from '../../../entities/background-category.entity';

@Injectable()
export class BackgroundService {
    constructor(
        private readonly backgroundRepository: BackgroundRepository,
        private readonly categoryRepository: BackgroundCategoryRepository,
    ) { }

    // Background methods
    async findAll(): Promise<Background[]> {
        return this.backgroundRepository.findAll();
    }

    async findByCategory(category: string): Promise<Background[]> {
        return this.backgroundRepository.findByCategory(category);
    }

    async findOne(id: string): Promise<Background | null> {
        return this.backgroundRepository.findOne(id);
    }

    async create(data: Partial<Background>): Promise<Background> {
        return this.backgroundRepository.create(data);
    }

    async upsertMany(backgrounds: Partial<Background>[]): Promise<void> {
        return this.backgroundRepository.upsertMany(backgrounds);
    }

    async update(id: string, data: Partial<Background>): Promise<Background | null> {
        return this.backgroundRepository.update(id, data);
    }

    async delete(id: string): Promise<void> {
        return this.backgroundRepository.delete(id);
    }

    // Category methods
    async getCategories(): Promise<BackgroundCategory[]> {
        return this.categoryRepository.findAll();
    }

    async getCategoryByValue(value: string): Promise<BackgroundCategory | null> {
        return this.categoryRepository.findByValue(value);
    }

    async upsertCategories(categories: Partial<BackgroundCategory>[]): Promise<void> {
        return this.categoryRepository.upsertMany(categories);
    }
}

