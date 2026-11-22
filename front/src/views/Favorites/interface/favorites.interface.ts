export interface Vocabulary {
  id: string
  word: string
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
