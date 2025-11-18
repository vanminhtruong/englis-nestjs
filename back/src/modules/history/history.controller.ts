import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { HistoryService } from './services/history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async getHistory(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const p = page ? parseInt(page.toString(), 10) : 1;
    const l = limit ? parseInt(limit.toString(), 10) : 6;
    const result = await this.historyService.findByUserPaginated(req.user.id, p, l);
    return {
      data: result.items,
      meta: {
        page: p,
        limit: l,
        total: result.total,
        pageCount: Math.ceil(result.total / l) || 1,
      },
    };
  }

  @Get('statistics')
  async getStatistics(@Request() req) {
    return this.historyService.getStatistics(req.user.id);
  }

  @Delete(':id')
  async deleteHistory(@Param('id') id: string, @Request() req) {
    await this.historyService.delete(id, req.user.id);
    return { message: 'History deleted successfully' };
  }
}
