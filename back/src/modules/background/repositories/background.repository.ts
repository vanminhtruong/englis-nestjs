import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Background } from '../../../entities/background.entity';

@Injectable()
export class BackgroundRepository {
    constructor(
        @InjectRepository(Background)
        private readonly repository: Repository<Background>,
    ) { }

    async findAll(): Promise<Background[]> {
        return this.repository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
        });
    }

    async findByCategory(category: string): Promise<Background[]> {
        return this.repository.find({
            where: { isActive: true, category },
            order: { sortOrder: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Background | null> {
        return this.repository.findOne({ where: { id } });
    }

    async create(data: Partial<Background>): Promise<Background> {
        const background = this.repository.create(data);
        return this.repository.save(background);
    }

    async upsertMany(backgrounds: Partial<Background>[]): Promise<void> {
        for (const bg of backgrounds) {
            const existing = await this.repository.findOne({ where: { url: bg.url } });
            if (existing) {
                await this.repository.update(existing.id, bg);
            } else {
                await this.create(bg);
            }
        }
    }

    async update(id: string, data: Partial<Background>): Promise<Background | null> {
        await this.repository.update(id, data);
        return this.findOne(id);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async getCategories(): Promise<string[]> {
        const result = await this.repository
            .createQueryBuilder('background')
            .select('DISTINCT background.category', 'category')
            .where('background.isActive = :isActive', { isActive: true })
            .andWhere('background.category IS NOT NULL')
            .getRawMany();
        return result.map((r) => r.category);
    }
}
