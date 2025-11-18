import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PracticeModeService } from './services/practice-mode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PracticeMode } from '../../entities/practice-mode.entity';

@Controller('practice-modes')
@UseGuards(JwtAuthGuard)
export class PracticeModeController {
  constructor(private readonly practiceModeService: PracticeModeService) {}

  @Get()
  async getAllModes(): Promise<PracticeMode[]> {
    try {
      console.log('Getting all practice modes...');
      const modes = await this.practiceModeService.getAllActiveModes();
      console.log('Found practice modes:', modes.length);
      return modes;
    } catch (error) {
      console.error('Error getting practice modes:', error);
      throw error;
    }
  }

  @Get(':key')
  async getModeByKey(@Param('key') key: string): Promise<PracticeMode | null> {
    return this.practiceModeService.getModeByKey(key);
  }

  @Post()
  async createMode(@Body() data: Partial<PracticeMode>): Promise<PracticeMode> {
    return this.practiceModeService.createMode(data);
  }

  @Put(':id')
  async updateMode(
    @Param('id') id: string,
    @Body() data: Partial<PracticeMode>,
  ): Promise<PracticeMode | null> {
    return this.practiceModeService.updateMode(id, data);
  }

  @Delete(':id')
  async deleteMode(@Param('id') id: string): Promise<void> {
    return this.practiceModeService.deleteMode(id);
  }
}
