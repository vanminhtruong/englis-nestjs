import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { PracticeType } from '../../../entities/practice-history.entity';

export class SubmitPracticeDto {
  @IsString()
  @IsNotEmpty()
  vocabularyId: string;

  @IsEnum(PracticeType)
  @IsNotEmpty()
  practiceType: PracticeType;

  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;

  @IsString()
  userAnswer: string;

  @IsNumber()
  timeSpent: number;

  @IsNumber()
  score: number;

  @IsNumber()
  @IsNotEmpty()
  questionStartTime: number;
}
