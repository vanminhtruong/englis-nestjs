// Tiến độ học tập interface
export interface LearningProgressDto {
    // Tổng quan tiến độ
    totalWords: number;
    masteredWords: number;
    learningWords: number;
    newWords: number;

    // Phần trăm hoàn thành
    masteryPercentage: number;

    // Điểm số và đánh giá
    totalScore: number;
    averageScore: number;
    rank: LearningRank;
    rankProgress: number; // tiến độ đến rank tiếp theo (0-100)

    // Thống kê luyện tập
    practiceStats: PracticeStats;

    // Chuỗi ngày học liên tiếp
    streak: StreakInfo;

    // Biểu đồ tuần
    weeklyProgress: WeeklyProgress[];

    // Thành tích
    achievements: Achievement[];
}

export interface PracticeStats {
    totalPractices: number;
    flashcardCount: number;
    multipleChoiceCount: number;
    typingCount: number;
    listeningCount: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
    totalTimeSpent: number; // seconds
}

export interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: Date | null;
    isActiveToday: boolean;
}

export interface WeeklyProgress {
    date: string;
    dayName: string;
    practiceCount: number;
    wordsLearned: number;
    score: number;
}

export enum LearningRank {
    BEGINNER = 'beginner',
    ELEMENTARY = 'elementary',
    INTERMEDIATE = 'intermediate',
    UPPER_INTERMEDIATE = 'upper_intermediate',
    ADVANCED = 'advanced',
    PROFICIENT = 'proficient',
    MASTER = 'master',
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date | null;
    isUnlocked: boolean;
    progress: number; // 0-100
    requirement: number;
    current: number;
}

// Rank thresholds
export const RANK_THRESHOLDS = {
    [LearningRank.BEGINNER]: 0,
    [LearningRank.ELEMENTARY]: 100,
    [LearningRank.INTERMEDIATE]: 500,
    [LearningRank.UPPER_INTERMEDIATE]: 1500,
    [LearningRank.ADVANCED]: 3000,
    [LearningRank.PROFICIENT]: 6000,
    [LearningRank.MASTER]: 10000,
};

export const RANK_NAMES = {
    [LearningRank.BEGINNER]: { vi: 'Người mới', en: 'Beginner', ko: '초보자' },
    [LearningRank.ELEMENTARY]: { vi: 'Sơ cấp', en: 'Elementary', ko: '초급' },
    [LearningRank.INTERMEDIATE]: { vi: 'Trung cấp', en: 'Intermediate', ko: '중급' },
    [LearningRank.UPPER_INTERMEDIATE]: { vi: 'Trung cấp cao', en: 'Upper Intermediate', ko: '중상급' },
    [LearningRank.ADVANCED]: { vi: 'Nâng cao', en: 'Advanced', ko: '고급' },
    [LearningRank.PROFICIENT]: { vi: 'Thành thạo', en: 'Proficient', ko: '숙련' },
    [LearningRank.MASTER]: { vi: 'Bậc thầy', en: 'Master', ko: '마스터' },
};
