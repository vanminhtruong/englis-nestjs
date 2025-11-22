<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-8"
      >
        {{ t("practice.title") }}
      </h1>

      <!-- Answer Effects -->
      <AnswerEffect
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

      <!-- Mode Selection with Start Button -->
      <ModeSelectionWithStart
        v-else-if="
          practiceState.isStarted.value && !practiceState.showPractice.value
        "
        :session="practiceState.session"
        @back="practiceHandle.backToModeSelection"
        @start-session="practiceHandle.startPracticeSession"
      />

      <!-- Practice Session -->
      <PracticeSession
        v-else
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
        :show="practiceState.showExitConfirmModal.value"
        @confirm="practiceHandle.handleConfirmExit"
        @cancel="practiceState.showExitConfirmModal.value = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { usePracticeState } from "./composable/manager-state/usePracticeState";
import { usePracticeHandle } from "./composable/manager-handle/usePracticeHandle";
import { usePracticeMount } from "./composable/manager-mount/usePracticeMount";
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
  () => import("../../components/AnswerEffect.vue")
);
const ExitConfirmationModal = defineAsyncComponent(
  () => import("./component/ExitConfirmationModal.vue")
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
</script>
