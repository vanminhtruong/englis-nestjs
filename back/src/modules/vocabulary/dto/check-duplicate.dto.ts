import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { PartOfSpeech } from '../../../entities/vocabulary.entity';

export class CheckDuplicateDto {
  @IsString()
  @MaxLength(2000)
  word: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  meaning?: string;

  @IsOptional()
  @IsEnum(PartOfSpeech)
  partOfSpeech?: PartOfSpeech;

  @IsOptional()
  @IsUUID()
  excludeId?: string;
}
