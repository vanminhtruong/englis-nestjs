import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryTopicDto {
    @IsString()
    date: string;

    @IsString()
    topic: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    color?: string;
}
