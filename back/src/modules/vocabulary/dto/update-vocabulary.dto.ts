import { IsOptional, IsString, IsEnum, IsArray, ArrayMaxSize } from 'class-validator';
import {
  DifficultyLevel,
  MasteryLevel,
} from '../../../entities/vocabulary.entity';

export class UpdateVocabularyDto {
  @IsString()
  @IsOptional()
  word?: string;

  @IsString()
  @IsOptional()
  pronunciation?: string;

  @IsString()
  @IsOptional()
  meaning?: string;

  @IsString()
  @IsOptional()
  example?: string;

  @IsString()
  @IsOptional()
  exampleTranslation?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  video?: string;

  @IsString()
  @IsOptional()
  audio?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @IsEnum(MasteryLevel)
  @IsOptional()
  masteryLevel?: MasteryLevel;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  tags?: string[];

  @IsOptional()
  categoryIds?: string[];
}
