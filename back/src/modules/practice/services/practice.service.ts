import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PracticeHistoryRepository } from '../repositories/practice-history.repository';
import { VocabularyRepository } from '../../vocabulary/repositories/vocabulary.repository';
import { SubmitPracticeDto } from '../dto/submit-practice.dto';
import { SaveIncompletePracticeDto } from '../dto/save-incomplete-practice.dto';
import { VocabularyWebSocketGateway } from '../../websocket/websocket.gateway';
import { HistoryService } from '../../history/services/history.service';
import { HistoryAction } from '../../../entities/history.entity';

@Injectable()
export class PracticeService {
  constructor(
    private readonly practiceHistoryRepository: PracticeHistoryRepository,
    private readonly vocabularyRepository: VocabularyRepository,
    private readonly websocketGateway: VocabularyWebSocketGateway,
    @Inject(forwardRef(() => HistoryService))
    private readonly historyService: HistoryService,
  ) { }

  async submitPractice(userId: string, submitDto: SubmitPracticeDto) {
    // Check if time exceeded 30 seconds
    const currentTime = Date.now();
    const timeElapsed = (currentTime - submitDto.questionStartTime) / 1000;
    const isTimeExceeded = timeElapsed > 30;

    // If time exceeded, mark as incorrect
    const finalIsCorrect = isTimeExceeded ? false : submitDto.isCorrect;
    const finalScore = isTimeExceeded ? 0 : submitDto.score;

    // Create practice history
    const history = await this.practiceHistoryRepository.create({
      userId,
      ...submitDto,
      isCorrect: finalIsCorrect,
      score: finalScore,
    });

    // Update vocabulary mastery
    await this.vocabularyRepository.updateMastery(
      submitDto.vocabularyId,
      userId,
      finalIsCorrect,
    );

    // Emit real-time event for practice history
    this.websocketGateway.emitPracticeSubmitted(history);

    // Log to unified history with correct action based on practice type
    let historyAction: HistoryAction;
    switch (submitDto.practiceType) {
      case 'flashcard':
        historyAction = HistoryAction.PRACTICE_FLASHCARD;
        break;
      case 'multiple_choice':
        historyAction = HistoryAction.PRACTICE_MULTIPLE_CHOICE;
        break;
      case 'typing':
        historyAction = HistoryAction.PRACTICE_TYPING;
        break;
      case 'listening':
        historyAction = HistoryAction.PRACTICE_LISTENING;
        break;
      case 'image_guess':
        historyAction = HistoryAction.PRACTICE_TYPING; // Use typing action for image_guess
        break;
      case 'ball_shooting':
        historyAction = HistoryAction.PRACTICE_BALL_SHOOTING;
        break;
      default:
        historyAction = HistoryAction.PRACTICE_FLASHCARD;
    }

    await this.historyService.create({
      userId,
      vocabularyId: submitDto.vocabularyId,
      action: historyAction,
      metadata: {
        practiceType: submitDto.practiceType,
        isCorrect: finalIsCorrect,
        score: finalScore,
        timeSpent: submitDto.timeSpent,
        userAnswer: submitDto.userAnswer,
        isTimeExceeded,
      },
      description: `Practiced ${submitDto.practiceType}: ${isTimeExceeded ? 'Time exceeded' : finalIsCorrect ? 'Correct' : 'Incorrect'}`,
    });

    return history;
  }

  async saveIncompletePractice(userId: string, dto: SaveIncompletePracticeDto) {
    console.log('=== Saving Incomplete Practice ===');
    console.log('User ID:', userId);
    console.log('Practice Type:', dto.practiceType);
    console.log('Total Questions:', dto.totalQuestions);
    console.log('Answered Count:', dto.answeredCount);
    console.log('Questions:', dto.questions);

    const results: any[] = [];

    // Save each answered question as practice history
    for (const question of dto.questions) {
      console.log('Processing question:', question.vocabularyId);

      const history = await this.practiceHistoryRepository.create({
        userId,
        vocabularyId: question.vocabularyId,
        practiceType: dto.practiceType,
        isCorrect: question.isCorrect,
        userAnswer: question.userAnswer,
        timeSpent: question.timeSpent,
        score: question.isCorrect ? 10 : 0,
      });

      console.log('Practice history created:', history.id);

      // Update vocabulary mastery for each question
      await this.vocabularyRepository.updateMastery(
        question.vocabularyId,
        userId,
        question.isCorrect,
      );

      console.log('Vocabulary mastery updated');

      results.push(history);

      // Log to unified history for each question
      let historyAction: HistoryAction;
      switch (dto.practiceType) {
        case 'flashcard':
          historyAction = HistoryAction.PRACTICE_FLASHCARD;
          break;
        case 'multiple_choice':
          historyAction = HistoryAction.PRACTICE_MULTIPLE_CHOICE;
          break;
        case 'typing':
          historyAction = HistoryAction.PRACTICE_TYPING;
          break;
        case 'listening':
          historyAction = HistoryAction.PRACTICE_LISTENING;
          break;
        case 'image_guess':
          historyAction = HistoryAction.PRACTICE_TYPING; // Use typing action for image_guess
          break;
        case 'ball_shooting':
          historyAction = HistoryAction.PRACTICE_BALL_SHOOTING;
          break;
        default:
          historyAction = HistoryAction.PRACTICE_FLASHCARD;
      }

      console.log('History action:', historyAction);

      // Create appropriate description key and data for i18n
      let descriptionKey: string;
      let descriptionData: any = {};

      if (dto.answeredCount === 1 && question.userAnswer === '' && !question.isCorrect) {
        // User exited immediately without answering any question
        descriptionKey = 'history.exitedPractice';
        descriptionData = { mode: dto.practiceType };
      } else {
        // User answered some questions before exiting
        descriptionKey = 'history.incompletePractice';
        descriptionData = {
          mode: dto.practiceType,
          status: question.isCorrect ? 'Correct' : 'Incorrect',
          answered: dto.answeredCount,
          total: dto.totalQuestions
        };
      }

      const unifiedHistory = await this.historyService.create({
        userId,
        vocabularyId: question.vocabularyId,
        action: historyAction,
        metadata: {
          practiceType: dto.practiceType,
          isCorrect: question.isCorrect,
          score: question.isCorrect ? 10 : 0,
          timeSpent: question.timeSpent,
          userAnswer: question.userAnswer,
          isIncomplete: true,
          totalQuestions: dto.totalQuestions,
          answeredCount: dto.answeredCount,
          descriptionKey,
          descriptionData,
        },
        description: `Exited practice ${dto.practiceType}`, // Fallback for non-i18n contexts
      });

      console.log('Unified history created:', unifiedHistory.id);

      // Emit WebSocket event for real-time update
      this.websocketGateway.emitHistoryCreated(unifiedHistory);
      console.log('WebSocket event emitted for history:', unifiedHistory.id);
    }

    console.log('=== Save Complete ===');
    console.log('Total saved:', results.length);

    return {
      message: 'Incomplete practice saved successfully',
      savedCount: results.length,
      results,
    };
  }
}
