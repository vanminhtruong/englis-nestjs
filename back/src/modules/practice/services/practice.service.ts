import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PracticeHistoryRepository } from '../repositories/practice-history.repository';
import { VocabularyRepository } from '../../vocabulary/repositories/vocabulary.repository';
import { SubmitPracticeDto } from '../dto/submit-practice.dto';
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
  ) {}

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
}
