import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDataShareDto } from './dto/create-data-share.dto';
import { DataShareService } from './services/data-share.service';

@Controller('data-share')
@UseGuards(JwtAuthGuard)
export class DataShareController {
  constructor(private readonly dataShareService: DataShareService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateDataShareDto) {
    return this.dataShareService.create(req.user.id, dto.email);
  }

  @Get('incoming')
  incoming(@Request() req) {
    return this.dataShareService.listIncoming(req.user.id);
  }

  @Post(':id/accept')
  accept(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.dataShareService.accept(req.user.id, id);
  }

  @Post(':id/reject')
  reject(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.dataShareService.reject(req.user.id, id);
  }

  @Delete(':id')
  cancel(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.dataShareService.cancel(req.user.id, id);
  }
}
