import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VocabularyTabService } from './vocabulary-tab.service';
import { CreateVocabularyTabDto } from './dto/create-vocabulary-tab.dto';
import { UpdateVocabularyTabDto } from './dto/update-vocabulary-tab.dto';

@Controller('vocabulary-tabs')
export class VocabularyTabController {
    constructor(private readonly vocabularyTabService: VocabularyTabService) { }

    @Post()
    create(@Body() createDto: CreateVocabularyTabDto) {
        return this.vocabularyTabService.create(createDto);
    }

    @Get()
    findAll() {
        return this.vocabularyTabService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vocabularyTabService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateVocabularyTabDto) {
        return this.vocabularyTabService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.vocabularyTabService.remove(id);
    }

    @Post(':id/vocabularies/:vocabularyId')
    addVocabulary(@Param('id') id: string, @Param('vocabularyId') vocabularyId: string) {
        return this.vocabularyTabService.addVocabulary(id, vocabularyId);
    }

    @Delete(':id/vocabularies/:vocabularyId')
    removeVocabulary(@Param('id') id: string, @Param('vocabularyId') vocabularyId: string) {
        return this.vocabularyTabService.removeVocabulary(id, vocabularyId);
    }
}
