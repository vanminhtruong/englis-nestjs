export type HistoryAction =
  | 'vocabulary_created'
  | 'vocabulary_updated'
  | 'vocabulary_deleted'
  | 'practice_flashcard'
  | 'practice_multiple_choice'
  | 'practice_typing'
  | 'practice_listening'

export interface History {
  id: string
  userId: string
  vocabularyId?: string
  action: HistoryAction
  metadata?: {
    word?: string
    translation?: string
    oldWord?: string
    newWord?: string
    oldTranslation?: string
    newTranslation?: string
    practiceType?: string
    isCorrect?: boolean
    score?: number
    timeSpent?: number
    userAnswer?: string
    descriptionKey?: string
    descriptionData?: any
  }
  description?: string
  createdAt: string
  vocabulary?: {
    id: string
    word: string
    meaning: string
    pronunciation?: string
    example?: string
    image?: string
    isFavorite: boolean
  }
}

export interface HistoryStatistics {
  vocabulary: {
    created: number
    updated: number
    deleted: number
    total: number
  }
  practice: {
    totalPractices: number
    correctAnswers: number
    incorrectAnswers: number
    accuracy: number
    totalScore: number
    totalTimeSpent: number
    averageTimePerPractice: number
  }
  totalActivities: number
}

export interface HistoryFilter {
  action?: 'all' | HistoryAction
  dateRange?: 'all' | 'today' | 'week' | 'month'
}
