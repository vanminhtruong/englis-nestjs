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
  Patch,
  Query,
} from '@nestjs/common';
import { CategoryService } from './services/category.service';
import { BulkCategoryDto } from './dto/bulk-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VocabularyWebSocketGateway } from '../websocket/websocket.gateway';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly websocketGateway: VocabularyWebSocketGateway,
  ) {}

  @Get()
  async findAll(@Request() req) {
    return this.categoryService.findAll(req.user.id);
  }

  @Get('page')
  async findPage(@Query() query: QueryCategoryDto, @Request() req) {
    return this.categoryService.findPage(req.user.id, query);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    return this.categoryService.findById(id, req.user.id);
  }

  @Get(':id/vocabularies')
  async getCategoryWithVocabularies(@Param('id') id: string, @Request() req) {
    return this.categoryService.getCategoryWithVocabularies(id, req.user.id);
  }

  @Post('bulk')
  async bulk(@Body() dto: BulkCategoryDto, @Request() req) {
    const result = await this.categoryService.bulk(req.user.id, dto);
    if (result.processedIds.length) {
      this.websocketGateway.server.emit('category:bulk-changed', {
        userId: req.user.id,
        action: dto.action,
        ids: result.processedIds,
      });
    }
    return result;
  }

  @Post()
  async create(@Body() createDto: CreateCategoryDto, @Request() req) {
    const category = await this.categoryService.create(req.user.id, createDto);
    this.websocketGateway.server.emit('category:created', category);
    return category;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
    @Request() req,
  ) {
    const category = await this.categoryService.update(id, req.user.id, updateDto);
    this.websocketGateway.server.emit('category:updated', category);
    return category;
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.categoryService.delete(id, req.user.id);
    this.websocketGateway.server.emit('category:deleted', { id });
    return { message: 'Category deleted successfully' };
  }

  @Patch(':id/pin')
  async togglePin(@Param('id') id: string, @Request() req) {
    const category = await this.categoryService.togglePin(id, req.user.id);
    this.websocketGateway.server.emit('category:pinned', category);
    this.websocketGateway.server.emit('category:updated', category);
    return category;
  }
}
