import { IsString, IsOptional } from 'class-validator';

export class UpdateVocabularyTabDto {
    @IsString()
    @IsOptional()
    name?: string;
}
