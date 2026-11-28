import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonalEventState } from '../../entities/seasonal-event-state.entity';
import { SeasonalController } from './seasonal.controller';
import { SeasonalService } from './seasonal.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeasonalEventState])],
  controllers: [SeasonalController],
  providers: [SeasonalService],
})
export class SeasonalModule {}
