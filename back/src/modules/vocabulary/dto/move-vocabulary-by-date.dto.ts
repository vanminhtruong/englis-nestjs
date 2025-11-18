import { IsNotEmpty, IsString } from 'class-validator';

export class MoveVocabularyByDateDto {
  @IsString()
  @IsNotEmpty()
  fromDate: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  toDate: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
