import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PracticeService } from './services/practice.service';
import { SubmitPracticeDto } from './dto/submit-practice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('submit')
  async submitPractice(@Body() submitDto: SubmitPracticeDto, @Request() req) {
    return this.practiceService.submitPractice(req.user.id, submitDto);
  }
}
