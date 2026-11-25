import { IsDefined, IsString, MaxLength, ValidateIf } from 'class-validator';

export class SelectSynonymDto {
  @ValidateIf((_, value) => value !== null)
  @IsDefined()
  @IsString()
  @MaxLength(120)
  selectedSynonym: string | null;
}
