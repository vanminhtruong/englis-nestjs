export interface VocabularyByDate {
  date: string;
  count: number;
  categories: CategoryGroup[];
}

export interface CategoryGroup {
  category: CategoryInfo;
  vocabularies: VocabularyItem[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface VocabularyItem {
  id: string
  word: string
  pronunciation: string
  meaning: string
  example?: string
  exampleTranslation?: string
  image?: string
  audio?: string
  difficulty: 'easy' | 'medium' | 'hard'
  masteryLevel: 'new' | 'learning' | 'familiar' | 'mastered'
  correctCount: number
  incorrectCount: number
  tags?: string[]
  isFavorite: boolean
  categories?: any[]
  createdAt: string
  updatedAt: string
  lastReviewedAt?: string
  nextReviewAt?: string
}
