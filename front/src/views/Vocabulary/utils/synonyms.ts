import type { PartOfSpeech } from './partOfSpeech'
export interface VocabularySynonym { word: string; pronunciation?: string; meaning?: string; partOfSpeech?: PartOfSpeech }
export interface SynonymSource { meaning?: string | null; selectedSynonym?: string | null; id?: string; vocabularyId?: string; word: string; pronunciation?: string | null; partOfSpeech?: string; synonyms?: VocabularySynonym[] | null }
export const synonymKey = (word: string) => word.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase()
export function synonymMeaning(item: VocabularySynonym | undefined, source?: SynonymSource | null): string {
  return item?.meaning?.trim() || source?.meaning || ''
}
export function displayedMeaning(source?: SynonymSource | null): string {
  return synonymMeaning(source?.synonyms?.find(item=>item.word===source.selectedSynonym), source)
}
export function synonymEntries(source: SynonymSource): VocabularySynonym[] {
  const seen = new Set([synonymKey(source.word || '')])
  return (Array.isArray(source.synonyms) ? source.synonyms : []).filter(item => {
    if (!item || typeof item.word !== 'string' || !item.word.trim() || seen.has(synonymKey(item.word))) return false
    seen.add(synonymKey(item.word)); return true
  })
}
