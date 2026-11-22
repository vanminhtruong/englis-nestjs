import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ImportBackgroundFromUrlDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  url: string;
}
