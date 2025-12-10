import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vocabulary } from '../../../entities/vocabulary.entity';
import { History, HistoryAction } from '../../../entities/history.entity';
import { User } from '../../../entities/user.entity';
import {
    PracticeStats,
    WeeklyProgress,
    StreakInfo
} from '../dto/learning-progress.dto';

@Injectable()
export class LearningProgressRepository {
    constructor(
        @InjectRepository(Vocabulary)
        private vocabularyRepository: Repository<Vocabulary>,
        @InjectRepository(History)
        private historyRepository: Repository<History>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async getVocabularyStats(userId: string) {
        const totalWords = await this.vocabularyRepository.count({
            where: { userId },
        });

        // Count words by mastery level (based on correct practice count)
        const vocabularies = await this.vocabularyRepository.find({
            where: { userId },
        });

        let masteredWords = 0;
        let learningWords = 0;
        let newWords = 0;

        for (const vocab of vocabularies) {
            const practiceCount = await this.historyRepository.count({
                where: {
                    userId,
                    vocabularyId: vocab.id,
                    action: HistoryAction.PRACTICE_FLASHCARD,
                },
            });

            if (practiceCount >= 5) {
                masteredWords++;
            } else if (practiceCount >= 1) {
                learningWords++;
            } else {
                newWords++;
            }
        }

        return { totalWords, masteredWords, learningWords, newWords };
    }

    async getPracticeStats(userId: string): Promise<PracticeStats> {
        const histories = await this.historyRepository.find({
            where: { userId },
        });

        const practiceTypes = [
            HistoryAction.PRACTICE_FLASHCARD,
            HistoryAction.PRACTICE_MULTIPLE_CHOICE,
            HistoryAction.PRACTICE_TYPING,
            HistoryAction.PRACTICE_LISTENING,
            HistoryAction.PRACTICE_BALL_SHOOTING,
            HistoryAction.PRACTICE_SNAKE,
        ];

        const practiceHistories = histories.filter(h =>
            practiceTypes.includes(h.action as HistoryAction)
        );

        const flashcardCount = practiceHistories.filter(
            h => h.action === HistoryAction.PRACTICE_FLASHCARD
        ).length;
        const multipleChoiceCount = practiceHistories.filter(
            h => h.action === HistoryAction.PRACTICE_MULTIPLE_CHOICE
        ).length;
        const typingCount = practiceHistories.filter(
            h => h.action === HistoryAction.PRACTICE_TYPING
        ).length;
        const listeningCount = practiceHistories.filter(
            h => h.action === HistoryAction.PRACTICE_LISTENING
        ).length;
        const snakeCount = practiceHistories.filter(
            h => h.action === HistoryAction.PRACTICE_SNAKE
        ).length;

        const correctAnswers = practiceHistories.filter(
            h => h.metadata?.isCorrect === true
        ).length;
        const wrongAnswers = practiceHistories.filter(
            h => h.metadata?.isCorrect === false
        ).length;

        const totalTimeSpent = practiceHistories.reduce(
            (acc, h) => acc + (h.metadata?.timeSpent || 0),
            0
        );

        const accuracy = practiceHistories.length > 0
            ? Math.round((correctAnswers / practiceHistories.length) * 100)
            : 0;

        return {
            totalPractices: practiceHistories.length,
            flashcardCount,
            multipleChoiceCount,
            typingCount,
            listeningCount,
            snakeCount,
            correctAnswers,
            wrongAnswers,
            accuracy,
            totalTimeSpent,
        };
    }

    async getStreakInfo(userId: string): Promise<StreakInfo> {
        const histories = await this.historyRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });

        if (histories.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastPracticeDate: null,
                isActiveToday: false,
            };
        }

        const practiceTypes = [
            HistoryAction.PRACTICE_FLASHCARD,
            HistoryAction.PRACTICE_MULTIPLE_CHOICE,
            HistoryAction.PRACTICE_TYPING,
            HistoryAction.PRACTICE_LISTENING,
            HistoryAction.PRACTICE_BALL_SHOOTING,
            HistoryAction.PRACTICE_SNAKE,
        ];

        const practiceHistories = histories.filter(h =>
            practiceTypes.includes(h.action as HistoryAction)
        );

        if (practiceHistories.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastPracticeDate: null,
                isActiveToday: false,
            };
        }

        // Get unique practice dates
        const practiceDates = [...new Set(
            practiceHistories.map(h => new Date(h.createdAt).toISOString().split('T')[0])
        )].sort().reverse();

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const isActiveToday = practiceDates[0] === today;
        const lastPracticeDate = new Date(practiceDates[0]);

        // Calculate current streak
        let currentStreak = 0;
        let checkDate = isActiveToday ? today : yesterday;

        for (const date of practiceDates) {
            if (date === checkDate) {
                currentStreak++;
                const prevDate = new Date(checkDate);
                prevDate.setDate(prevDate.getDate() - 1);
                checkDate = prevDate.toISOString().split('T')[0];
            } else {
                break;
            }
        }

        // If last practice was not today or yesterday, streak is broken
        if (!isActiveToday && practiceDates[0] !== yesterday) {
            currentStreak = 0;
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 1;

        for (let i = 0; i < practiceDates.length - 1; i++) {
            const currentDate = new Date(practiceDates[i]);
            const nextDate = new Date(practiceDates[i + 1]);
            const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        return {
            currentStreak,
            longestStreak,
            lastPracticeDate,
            isActiveToday,
        };
    }

    async getWeeklyProgress(userId: string): Promise<WeeklyProgress[]> {
        const weeklyProgress: WeeklyProgress[] = [];
        const today = new Date();
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
            const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

            const practiceHistories = await this.historyRepository.find({
                where: {
                    userId,
                    createdAt: Between(startOfDay, endOfDay),
                },
            });

            const practiceTypes = [
                HistoryAction.PRACTICE_FLASHCARD,
                HistoryAction.PRACTICE_MULTIPLE_CHOICE,
                HistoryAction.PRACTICE_TYPING,
                HistoryAction.PRACTICE_LISTENING,
                HistoryAction.PRACTICE_BALL_SHOOTING,
                HistoryAction.PRACTICE_SNAKE,
            ];

            const practiceCount = practiceHistories.filter(h =>
                practiceTypes.includes(h.action as HistoryAction)
            ).length;

            const vocabHistories = practiceHistories.filter(
                h => h.action === HistoryAction.VOCABULARY_CREATED
            );

            const score = practiceHistories
                .filter(h => practiceTypes.includes(h.action as HistoryAction))
                .reduce((acc, h) => acc + (h.metadata?.score || 0), 0);

            weeklyProgress.push({
                date: dateStr,
                dayName: dayNames[date.getDay()],
                practiceCount,
                wordsLearned: vocabHistories.length,
                score,
            });
        }

        return weeklyProgress;
    }

    async getTotalScore(userId: string): Promise<number> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return user?.totalScore || 0;
    }

    async getAverageScore(userId: string): Promise<number> {
        const histories = await this.historyRepository.find({
            where: { userId },
        });

        const practiceTypes = [
            HistoryAction.PRACTICE_FLASHCARD,
            HistoryAction.PRACTICE_MULTIPLE_CHOICE,
            HistoryAction.PRACTICE_TYPING,
            HistoryAction.PRACTICE_LISTENING,
            HistoryAction.PRACTICE_BALL_SHOOTING,
            HistoryAction.PRACTICE_SNAKE,
        ];

        const practiceHistories = histories.filter(h =>
            practiceTypes.includes(h.action as HistoryAction) && h.metadata?.score
        );

        if (practiceHistories.length === 0) return 0;

        const totalScore = practiceHistories.reduce(
            (acc, h) => acc + (h.metadata?.score || 0),
            0
        );

        return Math.round(totalScore / practiceHistories.length);
    }
}
