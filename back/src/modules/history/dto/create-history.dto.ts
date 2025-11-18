import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { HistoryAction } from '../../../entities/history.entity';

export class CreateHistoryDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  vocabularyId?: string;

  @IsEnum(HistoryAction)
  @IsNotEmpty()
  action: HistoryAction;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  description?: string;
}
