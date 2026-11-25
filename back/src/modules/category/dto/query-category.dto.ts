import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, Matches } from 'class-validator';

export const CATEGORY_PAGE_SIZE = 8;

export class QueryCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page = 1;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search = '';

  @IsOptional()
  @IsIn(['all', 'name', 'description', 'vocabulary'])
  scope: 'all' | 'name' | 'description' | 'vocabulary' = 'all';

  @IsOptional()
  @IsIn(['all', 'pinned', 'unpinned'])
  pinned: 'all' | 'pinned' | 'unpinned' = 'all';

  @IsOptional()
  @IsIn(['all', 'empty', 'populated'])
  content: 'all' | 'empty' | 'populated' = 'all';

  @IsOptional()
  @IsIn(['all', 'preset', 'custom'])
  iconType: 'all' | 'preset' | 'custom' = 'all';

  @IsOptional()
  @Matches(/^#[0-9a-f]{6}$/i)
  color?: string;

  @IsOptional()
  @IsIn(['default', 'newest', 'oldest', 'nameAsc', 'nameDesc', 'mostWords', 'fewestWords', 'updated'])
  sort: 'default' | 'newest' | 'oldest' | 'nameAsc' | 'nameDesc' | 'mostWords' | 'fewestWords' | 'updated' = 'default';

  @IsOptional()
  @IsIn(['all', 'recommended', 'interested', 'neglected'])
  smart: 'all' | 'recommended' | 'interested' | 'neglected' = 'all';
}
