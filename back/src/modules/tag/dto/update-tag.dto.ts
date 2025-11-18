import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateTagDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  color?: string
}
