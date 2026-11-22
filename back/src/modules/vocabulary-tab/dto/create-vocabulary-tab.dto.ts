import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateVocabularyTabDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(
    /^(?:[a-z][a-z0-9-]{0,39}|\/uploads\/tab-icons\/[a-f0-9-]{36}\.(?:png|jpg|webp))$/,
  )
  icon?: string | null;
}
