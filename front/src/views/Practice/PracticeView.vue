<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-4xl mx-auto" :class="{ 'max-w-6xl': isBallShootingMode }">
      <h1
        v-if="!isBallShootingMode"
        class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-8"
      >
        {{ t("practice.title") }}
      </h1>

      <!-- Answer Effects -->
      <AnswerEffect
        v-if="!isBallShootingMode"
        :type="practiceState.answerEffectType.value"
        :trigger-key="practiceState.answerEffectKey.value"
      />

      <!-- Practice Mode Selection -->
      <PracticeModeSelection
        v-if="
          !practiceState.isStarted.value &&
          !practiceState.showDateSelection.value
        "
        :practice-modes="practiceState.practiceModes.value"
        :loading-modes="practiceState.loadingModes.value"
        :modes-loaded="practiceState.modesLoaded.value"
        :loading-practice-data="practiceState.loadingPracticeData.value"
        @mode-click="practiceHandle.handleModeClick"
        @retry-loading="practiceHandle.loadPracticeModes"
      />

      <!-- Date Selection -->
      <DateSelection
        v-else-if="
          practiceState.showDateSelection.value &&
          !practiceState.isStarted.value
        "
        :available-dates="practiceState.availableDates.value"
        :loading-dates="practiceState.loadingDates.value"
        :selected-date="practiceState.selectedDate.value"
        :loading-practice-data="practiceState.loadingPracticeData.value"
        @back="practiceHandle.backToModeSelection"
        @date-select="practiceHandle.selectDate"
        @start-practice-by-date="practiceHandle.startPracticeByDate"
      />

      <!-- Ball Shooting Game Mode -->
      <!-- Ball Shooting Game Mode -->
      <BallShootingGame
        v-else-if="isBallShootingMode && practiceState.isStarted.value"
        :questions="ballShootingQuestions"
        @back="practiceHandle.backToModeSelection"
        @complete="handleBallShootingComplete"
      />

      <!-- Snake Game Mode -->
      <SnakeGame
        v-else-if="isSnakeMode && practiceState.isStarted.value"
        :questions="snakeQuestions"
        @back="practiceHandle.backToModeSelection"
        @complete="handleSnakeComplete"
      />

      <!-- Mode Selection with Start Button (for other modes) -->
      <ModeSelectionWithStart
        v-else-if="
          practiceState.isStarted.value &&
          !practiceState.showPractice.value &&
          !isBallShootingMode &&
          !isSnakeMode
        "
        :session="practiceState.session"
        @back="practiceHandle.backToModeSelection"
        @start-session="practiceHandle.startPracticeSession"
      />

      <!-- Practice Session (for other modes) -->
      <PracticeSession
        v-else-if="!isBallShootingMode && !isSnakeMode"
        :session="practiceState.session"
        :current-question="practiceState.currentQuestion.value"
        :progress="practiceState.progress.value"
        :time-left="practiceState.timeLeft.value"
        :show-answer="practiceState.showAnswer.value"
        :user-answer="practiceState.userAnswer.value"
        :has-answered-question="practiceState.hasAnsweredQuestion.value"
        :is-last-question="practiceState.isLastQuestion.value"
        :total-correct="practiceState.totalCorrect.value"
        :total-score="practiceState.totalScore.value"
        :show-timeout-modal="practiceState.showTimeoutModal.value"
        @back="practiceHandle.backToModeSelection"
        @show-exit-confirm="practiceState.showExitConfirmModal.value = true"
        @reveal-answer="practiceState.showAnswer.value = true"
        @flashcard-answer="practiceHandle.handleFlashcardAnswer"
        @submit-answer="practiceHandle.onSubmitAnswer"
        @restart="practiceHandle.backToModeSelection"
        @next-question="practiceHandle.handleNextQuestion"
      />

      <!-- Exit Confirmation Modal -->
      <ExitConfirmationModal
        v-if="!isBallShootingMode"
        :show="practiceState.showExitConfirmModal.value"
        @confirm="practiceHandle.handleConfirmExit"
        @cancel="practiceState.showExitConfirmModal.value = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePracticeState } from "./composable/manager-state/usePracticeState";
import { usePracticeHandle } from "./composable/manager-handle/usePracticeHandle";
import { usePracticeMount } from "./composable/manager-mount/usePracticeMount";
import { practiceService } from "./service/practice.service";
import enLang from "./language/en";
import viLang from "./language/vi";
import koLang from "./language/ko";

// Async Components
const PracticeModeSelection = defineAsyncComponent(
  () => import("./component/PracticeModeSelection.vue")
);
const DateSelection = defineAsyncComponent(
  () => import("./component/DateSelection.vue")
);
const ModeSelectionWithStart = defineAsyncComponent(
  () => import("./component/ModeSelectionWithStart.vue")
);
const PracticeSession = defineAsyncComponent(
  () => import("./component/PracticeSession.vue")
);
const AnswerEffect = defineAsyncComponent(
  () => import("../../components/AnswerEffect.vue") as any
);
const ExitConfirmationModal = defineAsyncComponent(
  () => import("./component/ExitConfirmationModal.vue")
);
const BallShootingGame = defineAsyncComponent(
  () => import("./component/BallShootingGame/BallShootingGame.vue")
);
const SnakeGame = defineAsyncComponent(
  () => import("./component/SnakeGame/SnakeGame.vue")
);

const { t, mergeLocaleMessage } = useI18n();

// Register language cho practice view
mergeLocaleMessage("en", { practice: enLang });
mergeLocaleMessage("vi", { practice: viLang });
mergeLocaleMessage("ko", { practice: koLang });

const practiceState = usePracticeState();

const practiceHandle = usePracticeHandle(
  practiceState.startSession,
  practiceState.session,
  practiceState.currentQuestion,
  practiceState.userAnswer,
  practiceState.showAnswer,
  practiceState.currentQuestionStartTime,
  practiceState.nextQuestion,
  practiceState.isLastQuestion,
  practiceState.startTimer,
  practiceState.stopTimer,
  practiceState.showWrongAnswerModal,
  practiceState.hasAnsweredQuestion,
  practiceState.resetSession,
  practiceState.showPractice,
  practiceState.showDateSelection,
  practiceState.availableDates,
  practiceState.selectedDate,
  practiceState.loadingDates,
  practiceState.practiceModes,
  practiceState.loadingModes,
  practiceState.modesLoaded,
  practiceState.loadingPracticeData,
  practiceState.answerEffectType,
  practiceState.answerEffectKey,
  practiceState.showExitConfirmModal
);

usePracticeMount(practiceHandle.loadPracticeModes);

// Ball Shooting Mode State
const ballShootingQuestions = ref<any[]>([]);

const isBallShootingMode = computed(() => {
  return practiceState.session.mode === "ball_shooting";
});

// Watch for ball_shooting mode selection
watch(
  () => practiceState.session.mode,
  async (newMode) => {
    if (
      newMode === "ball_shooting" &&
      practiceState.session.questions.length > 0
    ) {
      ballShootingQuestions.value = practiceState.session.questions.map(
        (q) => ({
          vocabularyId: q.vocabularyId,
          word: q.word,
          pronunciation: q.pronunciation,
          meaning: q.meaning,
          example: q.example,
          image: q.image,
        })
      );
    }
  },
  { immediate: true }
);

// Handle Ball Shooting game completion
async function handleBallShootingComplete(results: any) {
  console.log("Ball Shooting completed:", results);

  // Submit results to backend for each answered question
  for (const result of results.results) {
    try {
      await practiceService.submitPractice({
        vocabularyId: result.vocabularyId,
        practiceType: "ball_shooting",
        isCorrect: result.isCorrect,
        userAnswer: result.word,
        timeSpent: Math.round(result.timeSpent),
        score: result.isCorrect ? Math.round(100 * result.comboMultiplier) : 0,
        questionStartTime: Date.now() - result.timeSpent * 1000,
      });
    } catch (error) {
      console.error("Failed to submit ball shooting result:", error);
    }
  }
}

// Snake Game Logic
const snakeQuestions = ref<any[]>([]);

const isSnakeMode = computed(() => {
  return practiceState.session.mode === "snake";
});

watch(
  () => practiceState.session.mode,
  async (newMode) => {
    if (newMode === "snake" && practiceState.session.questions.length > 0) {
      snakeQuestions.value = practiceState.session.questions.map((q) => ({
        vocabularyId: q.vocabularyId,
        word: q.word,
        pronunciation: q.pronunciation,
        meaning: q.meaning,
        example: q.example,
        image: q.image,
      }));
    }
  },
  { immediate: true }
);

async function handleSnakeComplete(results: any) {
  console.log("Snake Game completed:", results);

  // Submit results
  for (const result of results.results) {
    try {
      await practiceService.submitPractice({
        vocabularyId: result.vocabularyId,
        practiceType: "snake", // Use 'snake' as practiceType
        isCorrect: result.isCorrect,
        userAnswer: result.isCorrect ? "Correct" : "Incorrect", // Or meaningful answer if available
        timeSpent: Math.round(result.timeSpent),
        score: result.score,
        questionStartTime: Date.now() - result.timeSpent * 1000,
      });
    } catch (error) {
      console.error("Failed to submit snake result:", error);
    }
  }
}
</script>

