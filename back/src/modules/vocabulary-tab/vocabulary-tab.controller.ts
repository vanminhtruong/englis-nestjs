import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../common/services/upload.service';
import { VocabularyTabService } from './vocabulary-tab.service';
import { CreateVocabularyTabDto } from './dto/create-vocabulary-tab.dto';
import { UpdateVocabularyTabDto } from './dto/update-vocabulary-tab.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssignVocabularyTabsDto } from './dto/assign-vocabulary-tabs.dto';
import { ReplaceVocabularyTabsDto } from './dto/replace-vocabulary-tabs.dto';

@Controller('vocabulary-tabs')
@UseGuards(JwtAuthGuard)
export class VocabularyTabController {
  constructor(
    private readonly vocabularyTabService: VocabularyTabService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateVocabularyTabDto) {
    return this.vocabularyTabService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.vocabularyTabService.findAll(req.user.id);
  }

  @Post('upload-icon')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }),
  )
  async uploadIcon(
    @UploadedFile() file?: { buffer: Buffer; mimetype: string; size: number },
  ) {
    const url = await this.uploadService.saveTabIcon(file);
    return { url };
  }

  // Batch assignment is additive; it never deletes words or moves them out of other tabs.
  @Post('assign')
  assign(@Request() req, @Body() dto: AssignVocabularyTabsDto) {
    return this.vocabularyTabService.assignVocabularies(req.user.id, dto);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.vocabularyTabService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateVocabularyTabDto,
  ) {
    return this.vocabularyTabService.update(req.user.id, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.vocabularyTabService.remove(req.user.id, id);
  }

  @Put('vocabularies/:vocabularyId/tabs')
  replaceVocabularyTabs(
    @Request() req,
    @Param('vocabularyId') vocabularyId: string,
    @Body() dto: ReplaceVocabularyTabsDto,
  ) {
    return this.vocabularyTabService.replaceVocabularyTabs(
      req.user.id,
      vocabularyId,
      dto.tabIds,
    );
  }

  @Post(':id/vocabularies/:vocabularyId')
  addVocabulary(
    @Request() req,
    @Param('id') id: string,
    @Param('vocabularyId') vocabularyId: string,
  ) {
    return this.vocabularyTabService.addVocabulary(
      req.user.id,
      id,
      vocabularyId,
    );
  }

  @Delete(':id/vocabularies/:vocabularyId')
  removeVocabulary(
    @Request() req,
    @Param('id') id: string,
    @Param('vocabularyId') vocabularyId: string,
  ) {
    return this.vocabularyTabService.removeVocabulary(
      req.user.id,
      id,
      vocabularyId,
    );
  }
}
