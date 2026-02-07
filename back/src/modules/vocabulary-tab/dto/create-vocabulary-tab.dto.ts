import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVocabularyTabDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
