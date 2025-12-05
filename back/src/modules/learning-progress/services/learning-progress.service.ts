import { Injectable } from '@nestjs/common';
import { LearningProgressRepository } from '../repositories/learning-progress.repository';
import {
    LearningProgressDto,
    LearningRank,
    Achievement,
    RANK_THRESHOLDS
} from '../dto/learning-progress.dto';

@Injectable()
export class LearningProgressService {
    constructor(
        private readonly progressRepository: LearningProgressRepository,
    ) { }

    async getProgress(userId: string): Promise<LearningProgressDto> {
        const [vocabStats, practiceStats, streak, weeklyProgress, totalScore, averageScore] =
            await Promise.all([
                this.progressRepository.getVocabularyStats(userId),
                this.progressRepository.getPracticeStats(userId),
                this.progressRepository.getStreakInfo(userId),
                this.progressRepository.getWeeklyProgress(userId),
                this.progressRepository.getTotalScore(userId),
                this.progressRepository.getAverageScore(userId),
            ]);

        const masteryPercentage = vocabStats.totalWords > 0
            ? Math.round((vocabStats.masteredWords / vocabStats.totalWords) * 100)
            : 0;

        const { rank, rankProgress } = this.calculateRank(totalScore);
        const achievements = this.calculateAchievements(vocabStats, practiceStats, streak, totalScore);

        return {
            totalWords: vocabStats.totalWords,
            masteredWords: vocabStats.masteredWords,
            learningWords: vocabStats.learningWords,
            newWords: vocabStats.newWords,
            masteryPercentage,
            totalScore,
            averageScore,
            rank,
            rankProgress,
            practiceStats,
            streak,
            weeklyProgress,
            achievements,
        };
    }

    private calculateRank(totalScore: number): { rank: LearningRank; rankProgress: number } {
        const ranks = Object.entries(RANK_THRESHOLDS).sort((a, b) => b[1] - a[1]);

        for (const [rank, threshold] of ranks) {
            if (totalScore >= threshold) {
                // Find next rank
                const currentIndex = ranks.findIndex(r => r[0] === rank);
                const nextRank = ranks[currentIndex - 1];

                let rankProgress = 100;
                if (nextRank) {
                    const progressInRank = totalScore - threshold;
                    const rankRange = nextRank[1] - threshold;
                    rankProgress = Math.min(100, Math.round((progressInRank / rankRange) * 100));
                }

                return { rank: rank as LearningRank, rankProgress };
            }
        }

        return { rank: LearningRank.BEGINNER, rankProgress: 0 };
    }

    private calculateAchievements(
        vocabStats: any,
        practiceStats: any,
        streak: any,
        totalScore: number,
    ): Achievement[] {
        const achievements: Achievement[] = [
            // Word achievements
            {
                id: 'first_word',
                name: 'Bước đầu tiên',
                description: 'Học từ vựng đầu tiên',
                icon: '🎯',
                unlockedAt: vocabStats.totalWords >= 1 ? new Date() : null,
                isUnlocked: vocabStats.totalWords >= 1,
                progress: Math.min(100, vocabStats.totalWords >= 1 ? 100 : 0),
                requirement: 1,
                current: vocabStats.totalWords,
            },
            {
                id: 'vocabulary_10',
                name: 'Người mới bắt đầu',
                description: 'Học 10 từ vựng',
                icon: '📚',
                unlockedAt: vocabStats.totalWords >= 10 ? new Date() : null,
                isUnlocked: vocabStats.totalWords >= 10,
                progress: Math.min(100, Math.round((vocabStats.totalWords / 10) * 100)),
                requirement: 10,
                current: vocabStats.totalWords,
            },
            {
                id: 'vocabulary_50',
                name: 'Học viên chăm chỉ',
                description: 'Học 50 từ vựng',
                icon: '📖',
                unlockedAt: vocabStats.totalWords >= 50 ? new Date() : null,
                isUnlocked: vocabStats.totalWords >= 50,
                progress: Math.min(100, Math.round((vocabStats.totalWords / 50) * 100)),
                requirement: 50,
                current: vocabStats.totalWords,
            },
            {
                id: 'vocabulary_100',
                name: 'Nhà từ vựng',
                description: 'Học 100 từ vựng',
                icon: '🏆',
                unlockedAt: vocabStats.totalWords >= 100 ? new Date() : null,
                isUnlocked: vocabStats.totalWords >= 100,
                progress: Math.min(100, Math.round((vocabStats.totalWords / 100) * 100)),
                requirement: 100,
                current: vocabStats.totalWords,
            },
            {
                id: 'vocabulary_500',
                name: 'Bậc thầy từ vựng',
                description: 'Học 500 từ vựng',
                icon: '👑',
                unlockedAt: vocabStats.totalWords >= 500 ? new Date() : null,
                isUnlocked: vocabStats.totalWords >= 500,
                progress: Math.min(100, Math.round((vocabStats.totalWords / 500) * 100)),
                requirement: 500,
                current: vocabStats.totalWords,
            },

            // Practice achievements
            {
                id: 'practice_10',
                name: 'Luyện tập viên',
                description: 'Hoàn thành 10 bài luyện tập',
                icon: '💪',
                unlockedAt: practiceStats.totalPractices >= 10 ? new Date() : null,
                isUnlocked: practiceStats.totalPractices >= 10,
                progress: Math.min(100, Math.round((practiceStats.totalPractices / 10) * 100)),
                requirement: 10,
                current: practiceStats.totalPractices,
            },
            {
                id: 'practice_100',
                name: 'Người kiên trì',
                description: 'Hoàn thành 100 bài luyện tập',
                icon: '🔥',
                unlockedAt: practiceStats.totalPractices >= 100 ? new Date() : null,
                isUnlocked: practiceStats.totalPractices >= 100,
                progress: Math.min(100, Math.round((practiceStats.totalPractices / 100) * 100)),
                requirement: 100,
                current: practiceStats.totalPractices,
            },

            // Streak achievements
            {
                id: 'streak_3',
                name: 'Bắt đầu đều đặn',
                description: 'Duy trì chuỗi 3 ngày học liên tiếp',
                icon: '📅',
                unlockedAt: streak.longestStreak >= 3 ? new Date() : null,
                isUnlocked: streak.longestStreak >= 3,
                progress: Math.min(100, Math.round((streak.currentStreak / 3) * 100)),
                requirement: 3,
                current: streak.currentStreak,
            },
            {
                id: 'streak_7',
                name: 'Tuần hoàn hảo',
                description: 'Duy trì chuỗi 7 ngày học liên tiếp',
                icon: '🌟',
                unlockedAt: streak.longestStreak >= 7 ? new Date() : null,
                isUnlocked: streak.longestStreak >= 7,
                progress: Math.min(100, Math.round((streak.currentStreak / 7) * 100)),
                requirement: 7,
                current: streak.currentStreak,
            },
            {
                id: 'streak_30',
                name: 'Tháng vàng',
                description: 'Duy trì chuỗi 30 ngày học liên tiếp',
                icon: '🏅',
                unlockedAt: streak.longestStreak >= 30 ? new Date() : null,
                isUnlocked: streak.longestStreak >= 30,
                progress: Math.min(100, Math.round((streak.currentStreak / 30) * 100)),
                requirement: 30,
                current: streak.currentStreak,
            },

            // Accuracy achievements
            {
                id: 'accuracy_80',
                name: 'Chính xác cao',
                description: 'Đạt độ chính xác 80% trong luyện tập',
                icon: '🎯',
                unlockedAt: practiceStats.accuracy >= 80 ? new Date() : null,
                isUnlocked: practiceStats.accuracy >= 80,
                progress: Math.min(100, Math.round((practiceStats.accuracy / 80) * 100)),
                requirement: 80,
                current: practiceStats.accuracy,
            },
            {
                id: 'accuracy_95',
                name: 'Hoàn hảo',
                description: 'Đạt độ chính xác 95% trong luyện tập',
                icon: '💎',
                unlockedAt: practiceStats.accuracy >= 95 ? new Date() : null,
                isUnlocked: practiceStats.accuracy >= 95,
                progress: Math.min(100, Math.round((practiceStats.accuracy / 95) * 100)),
                requirement: 95,
                current: practiceStats.accuracy,
            },

            // Score achievements
            {
                id: 'score_1000',
                name: 'Ngàn điểm',
                description: 'Đạt tổng 1,000 điểm',
                icon: '⭐',
                unlockedAt: totalScore >= 1000 ? new Date() : null,
                isUnlocked: totalScore >= 1000,
                progress: Math.min(100, Math.round((totalScore / 1000) * 100)),
                requirement: 1000,
                current: totalScore,
            },
            {
                id: 'score_10000',
                name: 'Vạn điểm',
                description: 'Đạt tổng 10,000 điểm',
                icon: '🌟',
                unlockedAt: totalScore >= 10000 ? new Date() : null,
                isUnlocked: totalScore >= 10000,
                progress: Math.min(100, Math.round((totalScore / 10000) * 100)),
                requirement: 10000,
                current: totalScore,
            },

            // Mastery achievements
            {
                id: 'mastery_5',
                name: 'Thành thạo',
                description: 'Thành thạo 5 từ vựng',
                icon: '✅',
                unlockedAt: vocabStats.masteredWords >= 5 ? new Date() : null,
                isUnlocked: vocabStats.masteredWords >= 5,
                progress: Math.min(100, Math.round((vocabStats.masteredWords / 5) * 100)),
                requirement: 5,
                current: vocabStats.masteredWords,
            },
            {
                id: 'mastery_25',
                name: 'Chuyên gia',
                description: 'Thành thạo 25 từ vựng',
                icon: '🎓',
                unlockedAt: vocabStats.masteredWords >= 25 ? new Date() : null,
                isUnlocked: vocabStats.masteredWords >= 25,
                progress: Math.min(100, Math.round((vocabStats.masteredWords / 25) * 100)),
                requirement: 25,
                current: vocabStats.masteredWords,
            },
        ];

        return achievements;
    }
}
