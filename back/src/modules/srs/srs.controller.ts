import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewSrsDto } from './dto/review-srs.dto';
import { SrsService } from './srs.service';

@Controller('srs')
@UseGuards(JwtAuthGuard)
export class SrsController {
  constructor(private readonly service: SrsService) {}

  @Get('overview')
  getOverview(
    @Request() req: { user: { id: string } },
    @Query('tabId') tabId?: string,
  ) {
    return this.service.getOverview(req.user.id, tabId);
  }

  @Get('queue')
  getQueue(
    @Request() req: { user: { id: string } },
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('tabId') tabId?: string,
    @Query('includeScheduled') includeScheduled?: string,
  ) {
    return this.service.getQueue(req.user.id, limit, tabId, includeScheduled === 'true');
  }

  @Get('upcoming')
  getUpcoming(
    @Request() req: { user: { id: string } },
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('tabId') tabId?: string,
  ) {
    return this.service.getUpcoming(req.user.id, limit, page, tabId);
  }

  @Get('history')
  getHistory(
    @Request() req: { user: { id: string } },
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('tabId') tabId?: string,
  ) {
    return this.service.getHistory(req.user.id, limit, page, tabId);
  }

  @Post(':vocabularyId/practice')
  practice(
    @Request() req: { user: { id: string } },
    @Param('vocabularyId') vocabularyId: string,
    @Body() dto: ReviewSrsDto,
  ) {
    return this.service.submitPracticeRating(req.user.id, vocabularyId, dto.rating);
  }

  @Post(':vocabularyId/review')
  review(
    @Request() req: { user: { id: string } },
    @Param('vocabularyId') vocabularyId: string,
    @Body() dto: ReviewSrsDto,
  ) {
    return this.service.submitReview(req.user.id, vocabularyId, dto.rating);
  }
}
