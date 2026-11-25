import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import {
  DifficultyLevel,
  PartOfSpeech,
} from '../../../entities/vocabulary.entity';

export class CreateVocabularyDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  synonyms?: import('../../../common/vocabulary-synonyms').VocabularySynonym[];

  @IsOptional()
  @IsEnum(PartOfSpeech)
  partOfSpeech?: PartOfSpeech;

  @IsString()
  @IsNotEmpty()
  pronunciation: string;

  @IsString()
  @IsNotEmpty()
  meaning: string;

  @IsString()
  @IsOptional()
  example?: string;

  @IsString()
  @IsOptional()
  exampleTranslation?: string;

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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  tags?: string[];

  @IsOptional()
  categoryIds?: string[];
}
