import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackgroundCategory } from '../../../entities/background-category.entity';

@Injectable()
export class BackgroundCategoryRepository {
    constructor(
        @InjectRepository(BackgroundCategory)
        private readonly repository: Repository<BackgroundCategory>,
    ) { }

    async findAll(): Promise<BackgroundCategory[]> {
        return this.repository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' },
        });
    }

    async findOne(id: string): Promise<BackgroundCategory | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByValue(value: string): Promise<BackgroundCategory | null> {
        return this.repository.findOne({ where: { value } });
    }

    async create(data: Partial<BackgroundCategory>): Promise<BackgroundCategory> {
        const category = this.repository.create(data);
        return this.repository.save(category);
    }

    async upsertMany(categories: Partial<BackgroundCategory>[]): Promise<void> {
        for (const cat of categories) {
            const existing = await this.repository.findOne({ where: { value: cat.value } });
            if (existing) {
                await this.repository.update(existing.id, cat);
            } else {
                await this.create(cat);
            }
        }
    }

    async update(id: string, data: Partial<BackgroundCategory>): Promise<BackgroundCategory | null> {
        await this.repository.update(id, data);
        return this.findOne(id);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
