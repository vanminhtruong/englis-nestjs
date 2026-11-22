import { IsOptional, IsUUID } from 'class-validator';

export class PromoteOverflowTabDto {
  @IsUUID()
  tabId: string;

  @IsOptional()
  @IsUUID()
  previousTabId?: string | null;
}
