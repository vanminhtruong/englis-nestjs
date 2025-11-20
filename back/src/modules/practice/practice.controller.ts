import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PracticeService } from './services/practice.service';
import { SubmitPracticeDto } from './dto/submit-practice.dto';
import { SaveIncompletePracticeDto } from './dto/save-incomplete-practice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) { }

  @Post('submit')
  async submitPractice(@Body() submitDto: SubmitPracticeDto, @Request() req) {
    return this.practiceService.submitPractice(req.user.id, submitDto);
  }

  @Post('save-incomplete')
  async saveIncomplete(@Body() dto: SaveIncompletePracticeDto, @Request() req) {
    console.log('=== Controller: Received save-incomplete request ===');
    console.log('User:', req.user);
    console.log('Body:', dto);
    return this.practiceService.saveIncompletePractice(req.user.id, dto);
  }
}
