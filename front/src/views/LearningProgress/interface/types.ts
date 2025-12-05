// Interfaces for Learning Progress
export interface LearningProgressData {
    totalWords: number
    masteredWords: number
    learningWords: number
    newWords: number
    masteryPercentage: number
    totalScore: number
    averageScore: number
    rank: LearningRank
    rankProgress: number
    practiceStats: PracticeStats
    streak: StreakInfo
    weeklyProgress: WeeklyProgress[]
    achievements: Achievement[]
}

export interface PracticeStats {
    totalPractices: number
    flashcardCount: number
    multipleChoiceCount: number
    typingCount: number
    listeningCount: number
    correctAnswers: number
    wrongAnswers: number
    accuracy: number
    totalTimeSpent: number
}

export interface StreakInfo {
    currentStreak: number
    longestStreak: number
    lastPracticeDate: string | null
    isActiveToday: boolean
}

export interface WeeklyProgress {
    date: string
    dayName: string
    practiceCount: number
    wordsLearned: number
    score: number
}

export type LearningRank =
    | 'beginner'
    | 'elementary'
    | 'intermediate'
    | 'upper_intermediate'
    | 'advanced'
    | 'proficient'
    | 'master'

export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string | null
    isUnlocked: boolean
    progress: number
    requirement: number
    current: number
}

// Rank icons and colors
export const RANK_INFO: Record<LearningRank, { icon: string; color: string; gradient: string }> = {
    beginner: {
        icon: '🌱',
        color: '#10B981',
        gradient: 'from-green-400 to-green-600'
    },
    elementary: {
        icon: '🌿',
        color: '#22D3EE',
        gradient: 'from-cyan-400 to-cyan-600'
    },
    intermediate: {
        icon: '🌳',
        color: '#3B82F6',
        gradient: 'from-blue-400 to-blue-600'
    },
    upper_intermediate: {
        icon: '⭐',
        color: '#8B5CF6',
        gradient: 'from-violet-400 to-violet-600'
    },
    advanced: {
        icon: '🔥',
        color: '#F59E0B',
        gradient: 'from-amber-400 to-orange-600'
    },
    proficient: {
        icon: '💎',
        color: '#EC4899',
        gradient: 'from-pink-400 to-rose-600'
    },
    master: {
        icon: '👑',
        color: '#EAB308',
        gradient: 'from-yellow-400 to-amber-600'
    },
}

// Rank thresholds (same as backend)
export const RANK_THRESHOLDS: Record<LearningRank, number> = {
    beginner: 0,
    elementary: 100,
    intermediate: 500,
    upper_intermediate: 1500,
    advanced: 3000,
    proficient: 6000,
    master: 10000,
}
