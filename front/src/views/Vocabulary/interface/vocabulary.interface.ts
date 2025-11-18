export interface VocabularyForm {
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
  search: string
  difficulty: 'all' | 'easy' | 'medium' | 'hard'
}
