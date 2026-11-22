import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserBackgroundService } from '../services/user-background.service';
import { ImportBackgroundFromUrlDto } from '../dto/import-background-from-url.dto';
import { BackgroundService } from '../services/background.service';

@Controller('backgrounds')
export class BackgroundController {
  constructor(
    private readonly backgroundService: BackgroundService,
    private readonly userBackgroundService: UserBackgroundService,
  ) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    if (category) {
      return this.backgroundService.findByCategory(category);
    }
    return this.backgroundService.findAll();
  }

  @Get('categories')
  async getCategories() {
    return this.backgroundService.getCategories();
  }

  // Personal backgrounds are intentionally separate from the public presets.
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMyBackgrounds(@Request() req: { user: { id: string } }) {
    return this.userBackgroundService.findMine(req.user.id);
  }

  @Post('mine')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadMyBackground(
    @Request() req: { user: { id: string } },
    @UploadedFile()
    file?: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname: string;
    },
  ) {
    return this.userBackgroundService.upload(req.user.id, file);
  }

  @Post('mine/from-url')
  @UseGuards(JwtAuthGuard)
  importMyBackgroundFromUrl(
    @Request() req: { user: { id: string } },
    @Body() dto: ImportBackgroundFromUrlDto,
  ) {
    return this.userBackgroundService.importFromUrl(req.user.id, dto.url);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.backgroundService.findOne(id);
  }
}
