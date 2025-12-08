export interface PracticeQuestion {
  vocabularyId: string
  word: string
  pronunciation: string
  meaning: string
  example?: string
  image?: string
  options?: string[]
}

export type PracticeMode = 'flashcard' | 'multiple_choice' | 'typing' | 'listening' | 'image_guess' | 'ball_shooting'

export interface DateOption {
  date: string
  count: number
  formattedDate: string
}

export interface PracticeSession {
  mode: PracticeMode
  questions: PracticeQuestion[]
  currentIndex: number
  answers: Map<string, { answer: string; isCorrect: boolean; timeSpent: number }>
  startTime: number
}
