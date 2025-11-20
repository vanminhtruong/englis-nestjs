<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <h1
        class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-8"
      >
        {{ t("practice.title") }}
      </h1>

      <!-- Answer Effects -->
      <AnswerEffect :type="answerEffectType" :trigger-key="answerEffectKey" />

      <!-- Practice Mode Selection -->
      <PracticeModeSelection
        v-if="!isStarted && !showDateSelection"
        :practice-modes="practiceModes"
        :loading-modes="loadingModes"
        :modes-loaded="modesLoaded"
        :loading-practice-data="loadingPracticeData"
        @mode-click="handleModeClick"
        @retry-loading="loadPracticeModes"
      />

      <!-- Date Selection -->
      <DateSelection
        v-else-if="showDateSelection && !isStarted"
        :available-dates="availableDates"
        :loading-dates="loadingDates"
        :selected-date="selectedDate"
        :loading-practice-data="loadingPracticeData"
        @back="backToModeSelection"
        @date-select="selectDate"
        @start-practice-by-date="startPracticeByDate"
      />

      <!-- Mode Selection with Start Button -->
      <ModeSelectionWithStart
        v-else-if="isStarted && !showPractice"
        :session="session"
        @back="backToModeSelection"
        @start-session="startPracticeSession"
      />

      <!-- Practice Session -->
      <PracticeSession
        v-else
        :session="session"
        :current-question="currentQuestion"
        :progress="progress"
        :time-left="timeLeft"
        :show-answer="showAnswer"
        :user-answer="userAnswer"
        :has-answered-question="hasAnsweredQuestion"
        :is-last-question="isLastQuestion"
        :total-correct="totalCorrect"
        :total-score="totalScore"
        :show-timeout-modal="showTimeoutModal"
        @back="backToModeSelection"
        @show-exit-confirm="showExitConfirmModal = true"
        @reveal-answer="showAnswer = true"
        @flashcard-answer="handleFlashcardAnswer"
        @submit-answer="onSubmitAnswer"
        @restart="backToModeSelection"
        @next-question="handleNextQuestion"
      />

      <!-- Exit Confirmation Modal -->
      <ExitConfirmationModal
        :show="showExitConfirmModal"
        @confirm="handleConfirmExit"
        @cancel="showExitConfirmModal = false"
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

const {
  isStarted,
  showPractice,
  showAnswer,
  userAnswer,
  currentQuestionStartTime,
  timeLeft,
  timerInterval,
  showWrongAnswerModal,
  hasAnsweredQuestion,
  answerEffectType,
  answerEffectKey,
  showDateSelection,
  availableDates,
  selectedDate,
  loadingDates,
  practiceModes,
  loadingModes,
  modesLoaded,
  loadingPracticeData,
  showTimeoutModal,
  showExitConfirmModal,
  session,
  currentQuestion,
  progress,
  isLastQuestion,
  totalCorrect,
  totalScore,
  startSession,
  nextQuestion,
  resetSession,
  startTimer,
  stopTimer,
} = usePracticeState();

const {
  handleStartPractice,
  handleSubmitAnswer,
  handleFlashcardAnswer,
  loadAvailableDates,
  handleStartPracticeByDate,
  loadPracticeModes,
} = usePracticeHandle(
  startSession,
  session,
  currentQuestion,
  userAnswer,
  showAnswer,
  currentQuestionStartTime,
  nextQuestion,
  isLastQuestion,
  startTimer,
  stopTimer,
  showWrongAnswerModal,
  hasAnsweredQuestion,
  showPractice,
  showDateSelection,
  availableDates,
  selectedDate,
  loadingDates,
  practiceModes,
  loadingModes,
  modesLoaded,
  loadingPracticeData,
  answerEffectType,
  answerEffectKey
);

function selectMode(mode: "flashcard" | "typing" | "image_guess") {
  handleStartPractice(mode);
}

function handleModeClick(mode: any) {
  if (mode.key === "practice_by_date") {
    showDateSelectionMode();
  } else {
    selectMode(mode.key as "flashcard" | "typing" | "image_guess");
  }
}

function startPracticeSession() {
  showPractice.value = true;
  showAnswer.value = false;
  userAnswer.value = "";
  hasAnsweredQuestion.value = false;
  showWrongAnswerModal.value = false;
  startTimer();
}

function handleNextQuestion() {
  nextQuestion();
  startTimer();
}

function handleContinueAfterWrong() {
  showWrongAnswerModal.value = false;
  if (!isLastQuestion.value) {
    nextQuestion();
    startTimer();
  } else {
    showAnswer.value = true;
  }
}

// Date selection functions
function showDateSelectionMode() {
  showDateSelection.value = true;
  loadAvailableDates();
}

function backToModeSelection() {
  // Use the existing resetSession function to properly reset everything
  resetSession();

  // Also reset date selection states
  showDateSelection.value = false;
  selectedDate.value = null;
}

function selectDate(date: string) {
  selectedDate.value = date;
}

function startPracticeByDate(mode: "flashcard" | "typing" | "image_guess") {
  if (selectedDate.value) {
    handleStartPracticeByDate(mode, selectedDate.value);
  }
}

usePracticeMount(loadPracticeModes);

function onSubmitAnswer(value: string) {
  // Save the typed answer from child before evaluating
  userAnswer.value = (value ?? "").toString();
  handleSubmitAnswer();
}

async function handleConfirmExit() {
  try {
    // Save incomplete practice to backend
    const { practiceService } = await import("./service/practice.service");

    // Collect all answered questions
    const answeredQuestions: any[] = [];
    session.answers.forEach((answer, vocabularyId) => {
      answeredQuestions.push({
        vocabularyId,
        isCorrect: answer.isCorrect,
        userAnswer: answer.answer,
        timeSpent: answer.timeSpent,
      });
    });

    // If current question hasn't been answered, mark it as incorrect/skipped and include it
    if (
      currentQuestion.value &&
      !session.answers.has(currentQuestion.value.vocabularyId)
    ) {
      const timeSpent = Math.round(
        (Date.now() - currentQuestionStartTime.value) / 1000
      );
      answeredQuestions.push({
        vocabularyId: currentQuestion.value.vocabularyId,
        isCorrect: false,
        userAnswer: "", // Empty answer for skipped/exited question
        timeSpent: Math.max(0, timeSpent), // Ensure non-negative
      });
    }

    console.log("Exiting practice with answers:", answeredQuestions);
    console.log("Practice mode:", session.mode);

    // Save incomplete practice history
    if (answeredQuestions.length > 0) {
      const result = await practiceService.saveIncomplete({
        practiceType: session.mode,
        questions: answeredQuestions,
        totalQuestions: session.questions.length,
        answeredCount: answeredQuestions.length,
        isComplete: false,
      });
      console.log("Save incomplete result:", result);
    } else {
      console.log("No answered questions to save");
    }

    // Close modal and reset session
    showExitConfirmModal.value = false;
    stopTimer();
    backToModeSelection();
  } catch (error) {
    console.error("Error saving incomplete practice:", error);
    // Still close modal and reset even if save fails
    showExitConfirmModal.value = false;
    stopTimer();
    backToModeSelection();
  }
}
</script>
