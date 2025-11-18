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
} from '@nestjs/common';
import { CategoryService } from './services/category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
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

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    return this.categoryService.findById(id, req.user.id);
  }

  @Get(':id/vocabularies')
  async getCategoryWithVocabularies(@Param('id') id: string, @Request() req) {
    return this.categoryService.getCategoryWithVocabularies(id, req.user.id);
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
