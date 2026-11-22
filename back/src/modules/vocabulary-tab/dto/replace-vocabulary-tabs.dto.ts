import { ArrayMaxSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';
import { MAX_TABS_PER_WORD } from '../vocabulary-tab.constants';

export class ReplaceVocabularyTabsDto {
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MAX_TABS_PER_WORD)
  @IsUUID('4', { each: true })
  tabIds: string[];
}
