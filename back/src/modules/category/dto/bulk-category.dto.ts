import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsUUID } from 'class-validator';

export type CategoryBulkAction = 'pin' | 'unpin' | 'delete';

export class BulkCategoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  ids: string[];

  @IsIn(['pin', 'unpin', 'delete'])
  action: CategoryBulkAction;
}
