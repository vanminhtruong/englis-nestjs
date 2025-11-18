import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TagService } from './services/tag.service'
import { CreateTagDto } from './dto/create-tag.dto'
import { UpdateTagDto } from './dto/update-tag.dto'
import { VocabularyWebSocketGateway } from '../websocket/websocket.gateway'

@Controller('tag')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly websocketGateway: VocabularyWebSocketGateway,
  ) {}

  @Get()
  async findAll(@Request() req) {
    return this.tagService.findAll(req.user.id)
  }

  @Post()
  async create(@Body() createDto: CreateTagDto, @Request() req) {
    const tag = await this.tagService.create(req.user.id, createDto)
    this.websocketGateway.server.emit('tag:created', tag)
    return tag
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTagDto,
    @Request() req,
  ) {
    const tag = await this.tagService.update(id, req.user.id, updateDto)
    this.websocketGateway.server.emit('tag:updated', tag)
    return tag
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.tagService.delete(id, req.user.id)
    this.websocketGateway.server.emit('tag:deleted', { id })
    return { message: 'Tag deleted successfully' }
  }
}
