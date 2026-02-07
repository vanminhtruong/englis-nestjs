import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyTab } from '../../entities/vocabulary-tab.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { CreateVocabularyTabDto } from './dto/create-vocabulary-tab.dto';
import { UpdateVocabularyTabDto } from './dto/update-vocabulary-tab.dto';

@Injectable()
export class VocabularyTabService {
    constructor(
        @InjectRepository(VocabularyTab)
        private readonly vocabularyTabRepository: Repository<VocabularyTab>,
        @InjectRepository(Vocabulary)
        private readonly vocabularyRepository: Repository<Vocabulary>,
    ) { }

    async create(createDto: CreateVocabularyTabDto): Promise<VocabularyTab> {
        const tab = this.vocabularyTabRepository.create(createDto);
        return this.vocabularyTabRepository.save(tab);
    }

    async findAll(): Promise<VocabularyTab[]> {
        return this.vocabularyTabRepository.find({
            relations: ['vocabularies'],
        });
    }

    async findOne(id: string): Promise<VocabularyTab> {
        const tab = await this.vocabularyTabRepository.findOne({
            where: { id },
            relations: ['vocabularies'],
        });
        if (!tab) {
            throw new NotFoundException('Tab not found');
        }
        return tab;
    }

    async update(id: string, updateDto: UpdateVocabularyTabDto): Promise<VocabularyTab> {
        const tab = await this.findOne(id);
        this.vocabularyTabRepository.merge(tab, updateDto);
        return this.vocabularyTabRepository.save(tab);
    }

    async remove(id: string): Promise<void> {
        await this.vocabularyTabRepository.delete(id);
    }

    async addVocabulary(tabId: string, vocabularyId: string): Promise<VocabularyTab> {
        const tab = await this.findOne(tabId);
        const vocabulary = await this.vocabularyRepository.findOne({ where: { id: vocabularyId } });
        if (!vocabulary) {
            throw new NotFoundException('Vocabulary not found');
        }

        if (!tab.vocabularies.some(v => v.id === vocabulary.id)) {
            tab.vocabularies.push(vocabulary);
            return this.vocabularyTabRepository.save(tab);
        }
        return tab;
    }

    async removeVocabulary(tabId: string, vocabularyId: string): Promise<VocabularyTab> {
        const tab = await this.findOne(tabId);
        tab.vocabularies = tab.vocabularies.filter(v => v.id !== vocabularyId);
        return this.vocabularyTabRepository.save(tab);
    }
}
