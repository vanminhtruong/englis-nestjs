import type { PartOfSpeech } from '../utils/partOfSpeech'

export interface VocabularyForm {
  partOfSpeech?: PartOfSpeech
  synonyms?: import('../utils/synonyms').VocabularySynonym[]
  word: string
  pronunciation: string
  meaning: string
  example?: string
  exampleTranslation?: string
  image?: string
  video?: string
  audio?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  categoryIds?: string[]
}

export interface VocabularyFilter {
  partOfSpeech?: PartOfSpeech | 'all'
  search: string
  difficulty: 'all' | 'easy' | 'medium' | 'hard'
  categoryIds?: string[]
  tags?: string[]
}

