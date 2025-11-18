import { IsIn, IsString } from 'class-validator';

export class UpdateLayoutPreferenceDto {
  @IsString()
  @IsIn(['grid', 'list'])
  layout: 'grid' | 'list';
}

