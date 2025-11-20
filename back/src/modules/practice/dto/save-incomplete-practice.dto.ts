import { IsNotEmpty, IsArray, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { PracticeType } from '../../../entities/practice-history.entity';

class AnsweredQuestion {
    vocabularyId: string;
    isCorrect: boolean;
    userAnswer: string;
    timeSpent: number;
}

export class SaveIncompletePracticeDto {
    @IsEnum(PracticeType)
    @IsNotEmpty()
    practiceType: PracticeType;

    @IsArray()
    @IsNotEmpty()
    questions: AnsweredQuestion[];

    @IsNumber()
    @IsNotEmpty()
    totalQuestions: number;

    @IsNumber()
    @IsNotEmpty()
    answeredCount: number;

    @IsBoolean()
    @IsNotEmpty()
    isComplete: boolean;
}
