export interface Vocabulary {
  id: string
  word: string
  partOfSpeech?: import('../../Vocabulary/utils/partOfSpeech').PartOfSpeech
  selectedSynonym?: string | null
  synonyms?: import('../../Vocabulary/utils/synonyms').VocabularySynonym[];
  pronunciation: string
  meaning: string
  example?: string
  exampleTranslation?: string
  image?: string
  video?: string
  backgroundUrl?: string | null
  animatedBackground?: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  correctCount: number
  incorrectCount: number
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}
