import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { LearningProgressService } from './services/learning-progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('learning-progress')
@UseGuards(JwtAuthGuard)
export class LearningProgressController {
    constructor(private readonly progressService: LearningProgressService) { }

    @Get()
    async getProgress(@Request() req) {
        return this.progressService.getProgress(req.user.id);
    }
}
