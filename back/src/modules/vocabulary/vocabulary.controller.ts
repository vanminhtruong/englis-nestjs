import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VocabularyService } from './services/vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from '../../common/services/upload.service';
import { MoveVocabularyByDateDto } from './dto/move-vocabulary-by-date.dto';
import { VocabularyWebSocketGateway } from '../websocket/websocket.gateway';
import { UpdateCategoryTopicDto } from './dto/update-category-topic.dto';

@Controller('vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(
    private readonly vocabularyService: VocabularyService,
    private readonly uploadService: UploadService,
    private readonly websocketGateway: VocabularyWebSocketGateway,
  ) { }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('difficulty') difficulty?: 'easy' | 'medium' | 'hard',
  ) {
    const p = page ? parseInt(page.toString(), 10) : 1;
    const l = limit ? parseInt(limit.toString(), 10) : 6;
    const result = await this.vocabularyService.findAllPaginated(
      req.user.id,
      p,
      l,
      search,
      difficulty,
    );
    return {
      data: result.items,
      meta: {
        page: p,
        limit: l,
        total: result.total,
        pageCount: Math.ceil(result.total / l) || 1,
      },
    };
  }

  @Get('practice')
  async findForPractice(@Request() req, @Query('limit') limit?: number) {
    return this.vocabularyService.findForPractice(
      req.user.id,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('tags')
  async findByTags(@Request() req, @Query('tags') tags: string) {
    const tagArray = tags ? tags.split(',') : [];
    return this.vocabularyService.findByTags(req.user.id, tagArray);
  }

  @Get('favorites/list')
  async getFavorites(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const p = page ? parseInt(page.toString(), 10) : 1;
    const l = limit ? parseInt(limit.toString(), 10) : 6;
    const result = await this.vocabularyService.getFavoritesPaginated(
      req.user.id,
      p,
      l,
    );
    return {
      data: result.items,
      meta: {
        page: p,
        limit: l,
        total: result.total,
        pageCount: Math.ceil(result.total / l) || 1,
      },
    };
  }

  @Get('by-learning-date')
  async findByLearningDate(@Request() req) {
    return this.vocabularyService.findByLearningDate(req.user.id);
  }

  @Patch('settings/filter-state')
  async updateFilterState(@Body('isExpanded') isExpanded: boolean, @Request() req) {
    await this.vocabularyService.updateFilterState(req.user.id, isExpanded);
    return { success: true };
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    return this.vocabularyService.findById(id, req.user.id);
  }

  @Post()
  async create(@Body() createDto: CreateVocabularyDto, @Request() req) {
    // Handle base64 image if provided
    if (createDto.image && createDto.image.startsWith('data:image')) {
      const imagePath = await this.uploadService.saveBase64Image(
        createDto.image,
      );
      createDto.image = imagePath;
    }
    return this.vocabularyService.create(req.user.id, createDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    const imagePath = await this.uploadService.saveFile(file);
    return { url: imagePath };
  }

  @Put(':id/favorite')
  async toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.vocabularyService.toggleFavorite(id, req.user.id);
  }

  @Patch(':id/pin')
  async togglePin(@Param('id') id: string, @Request() req) {
    const vocabulary = await this.vocabularyService.togglePin(
      id,
      req.user.id,
    );
    if (vocabulary) {
      this.websocketGateway.server.emit('vocabulary:pinned', vocabulary);
      this.websocketGateway.emitVocabularyUpdated(vocabulary);
    }
    return vocabulary;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateVocabularyDto,
    @Request() req,
  ) {
    // Handle base64 image if provided
    if (updateDto.image && updateDto.image.startsWith('data:image')) {
      // Delete old image if exists
      const oldVocab = await this.vocabularyService.findById(id, req.user.id);
      if (oldVocab?.image) {
        await this.uploadService.deleteFile(oldVocab.image);
      }
      const imagePath = await this.uploadService.saveBase64Image(
        updateDto.image,
      );
      updateDto.image = imagePath;
    }
    return this.vocabularyService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.vocabularyService.delete(id, req.user.id);
    return { message: 'Vocabulary deleted successfully' };
  }

  @Post('move-by-date')
  async moveByDate(
    @Body() dto: MoveVocabularyByDateDto,
    @Request() req,
  ) {
    await this.vocabularyService.moveByLearningDate(req.user.id, dto);
    this.websocketGateway.emitVocabularyByDateRefresh(req.user.id);
    return { message: 'Vocabularies moved successfully' };
  }
  @Put('category-topic/update')
  async updateCategoryTopic(
    @Body() dto: UpdateCategoryTopicDto,
    @Request() req,
  ) {
    return this.vocabularyService.updateTopic(req.user.id, dto.date, dto.topic, dto.icon, dto.color);
  }
}
