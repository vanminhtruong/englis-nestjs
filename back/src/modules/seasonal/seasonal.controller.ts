import { Controller, Get, Header } from '@nestjs/common';
import { SeasonalService } from './seasonal.service';

@Controller('seasonal')
export class SeasonalController {
  constructor(private readonly seasonal: SeasonalService) {}

  @Get('state')
  @Header('Cache-Control', 'no-store')
  getState() {
    return this.seasonal.getState();
  }
}
