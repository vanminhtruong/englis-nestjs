<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-4xl mx-auto" :class="{ 'max-w-6xl': isBallShootingMode }">
      <h1
        v-if="!isBallShootingMode && !selectedMode"
        class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-8"
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
          !practiceState.isStarted.value && !practiceState.showDateSelection.value && !selectedMode
        "
        :practice-modes="practiceState.practiceModes.value"
        :loading-modes="practiceState.loadingModes.value"
        :modes-loaded="practiceState.modesLoaded.value"
        :loading-practice-data="practiceState.loadingPracticeData.value"
        @mode-click="openPracticeSetup"
        @retry-loading="practiceHandle.loadPracticeModes"
      />

      <!-- Shared pre-game setup: one tab picker for every practice mode. -->
      <PracticeStartSetup
        v-else-if="
          selectedMode && !practiceState.isStarted.value && !practiceState.showDateSelection.value
        "
        :mode="selectedMode"
        :tabs="practiceTabs"
        :active-tab-id="selectedTabId"
        :loading-tabs="loadingTabs"
        :tabs-error="tabsError"
        :loading="practiceState.loadingPracticeData.value"
        :error-message="practiceHandle.practiceError.value"
        @back="backToModes"
        @select-tab="selectPracticeTab"
        @retry-tabs="loadPracticeTabs"
        @start="beginSelectedPractice"
      />

      <!-- Date Selection -->
      <DateSelection
        v-else-if="practiceState.showDateSelection.value && !practiceState.isStarted.value"
        :available-dates="practiceState.availableDates.value"
        :loading-dates="practiceState.loadingDates.value"
        :selected-date="practiceState.selectedDate.value"
        :tab-name="selectedTabName"
        :tab-icon="selectedTabIcon"
        :loading-practice-data="practiceState.loadingPracticeData.value"
        @back="backToSetup"
        @date-select="practiceHandle.selectDate"
        @start-practice-by-date="beginDatePractice"
      />

      <!-- Ball Shooting Game Mode -->
      <!-- Ball Shooting Game Mode -->
      <BallShootingGame
        v-else-if="isBallShootingMode && practiceState.isStarted.value"
        :questions="ballShootingQuestions"
        @back="backToModes"
        @complete="handleBallShootingComplete"
      />

      <!-- Snake Game Mode -->
      <SnakeGame
        v-else-if="isSnakeMode && practiceState.isStarted.value"
        :questions="snakeQuestions"
        @back="backToModes"
        @complete="handleSnakeComplete"
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
        @back="backToModes"
        @show-exit-confirm="practiceState.showExitConfirmModal.value = true"
        @reveal-answer="practiceState.showAnswer.value = true"
        @flashcard-answer="practiceHandle.handleFlashcardAnswer"
        @submit-answer="practiceHandle.onSubmitAnswer"
        @restart="backToModes"
        @next-question="practiceHandle.handleNextQuestion"
      />

      <p
        v-if="practiceState.showDateSelection.value && practiceHandle.practiceError.value"
        role="alert"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
      >
        {{ practiceHandle.practiceError.value }}
      </p>

      <!-- Exit Confirmation Modal -->
      <ExitConfirmationModal
        v-if="!isBallShootingMode"
        :show="practiceState.showExitConfirmModal.value"
        @confirm="confirmExit"
        @cancel="practiceState.showExitConfirmModal.value = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed, onMounted, ref } from "vue";
import apiService from "../../services/api.service";
import type { PracticeMode } from "./interface/practice.interface";
import type { PracticeMode as PracticeModeItem } from "./service/practice.service";
import { usePracticeState } from "./composable/manager-state/usePracticeState";
import { usePracticeHandle } from "./composable/manager-handle/usePracticeHandle";
import { usePracticeMount } from "./composable/manager-mount/usePracticeMount";
import { usePracticeI18n } from "./composable/manager-i18n/usePracticeI18n";
import { useBallShootingGame } from "./composable/manager-game/useBallShootingGame";
import { useSnakeGame } from "./composable/manager-game/useSnakeGame";

// Async Components
const PracticeModeSelection = defineAsyncComponent(
  () => import("./component/PracticeModeSelection.vue"),
);
const DateSelection = defineAsyncComponent(() => import("./component/DateSelection.vue"));
const PracticeStartSetup = defineAsyncComponent(() => import("./component/PracticeStartSetup.vue"));
const PracticeSession = defineAsyncComponent(() => import("./component/PracticeSession.vue"));
const AnswerEffect = defineAsyncComponent(() => import("../../components/AnswerEffect.vue"));
const ExitConfirmationModal = defineAsyncComponent(
  () => import("./component/ExitConfirmationModal.vue"),
);
const BallShootingGame = defineAsyncComponent(
  () => import("./component/BallShootingGame/BallShootingGame.vue"),
);
const SnakeGame = defineAsyncComponent(() => import("./component/SnakeGame/SnakeGame.vue"));

const { t } = usePracticeI18n();

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
  practiceState.showExitConfirmModal,
);

usePracticeMount(practiceHandle.loadPracticeModes);

// Ball Shooting Game
const { ballShootingQuestions, isBallShootingMode, handleBallShootingComplete } =
  useBallShootingGame(computed(() => practiceState.session));

// Snake Game
const { snakeQuestions, isSnakeMode, handleSnakeComplete } = useSnakeGame(
  computed(() => practiceState.session),
);

// Shared practice setup. Tabs are read from the same API as the vocabulary page.
// The selection is local to Practice; it does not mutate the user's saved vocabulary tab.
interface PracticeTab {
  id: string;
  name: string;
  icon?: string | null;
  vocabularies?: { id: string }[];
}
const selectedMode = ref<PracticeModeItem | null>(null);
const practiceTabs = ref<PracticeTab[]>([]);
const selectedTabId = ref<string | null>(null);
const activeTab = computed(() => practiceTabs.value.find((tab) => tab.id === selectedTabId.value));
const selectedTabName = computed(() => activeTab.value?.name ?? t("practice.setupAllTabs"));
const selectedTabIcon = computed(() => activeTab.value?.icon ?? null);
const loadingTabs = ref(true);
const tabsError = ref(false);

async function loadPracticeTabs() {
  loadingTabs.value = true;
  tabsError.value = false;
  try {
    const [tabsResponse, settingsResponse] = await Promise.all([
      apiService.tab.getAll(),
      apiService.vocabulary.getSettings().catch(() => null),
    ]);
    practiceTabs.value = (tabsResponse.data as PracticeTab[]).map(
      ({ id, name, icon, vocabularies }) => ({
        id,
        name,
        icon,
        vocabularies,
      }),
    );
    const preferred: string | null = settingsResponse?.data?.activeTabId ?? null;
    if (preferred && practiceTabs.value.some((tab) => tab.id === preferred)) {
      selectedTabId.value = preferred;
    } else if (
      selectedTabId.value &&
      !practiceTabs.value.some((tab) => tab.id === selectedTabId.value)
    ) {
      selectedTabId.value = null;
    }
  } catch {
    tabsError.value = true;
    // The All Vocabulary option can still be used if tabs could not be loaded.
    selectedTabId.value = null;
  } finally {
    loadingTabs.value = false;
  }
}

function openPracticeSetup(mode: PracticeModeItem) {
  selectedMode.value = mode;
  practiceHandle.practiceError.value = "";
}

function selectPracticeTab(tabId: string | null) {
  selectedTabId.value = tabId;
  practiceHandle.practiceError.value = "";
}

async function beginSelectedPractice() {
  const mode = selectedMode.value?.key;
  if (!mode || practiceState.loadingPracticeData.value || loadingTabs.value) return;
  if (mode === "practice_by_date") {
    practiceHandle.showDateSelectionMode(selectedTabId.value);
    return;
  }
  if (!["flashcard", "typing", "image_guess", "ball_shooting", "snake"].includes(mode)) return;
  const started = await practiceHandle.handleStartPractice(
    mode as PracticeMode,
    selectedTabId.value,
  );
  if (started && mode !== "ball_shooting" && mode !== "snake") {
    practiceHandle.startPracticeSession();
  }
}

async function beginDatePractice(mode: "flashcard" | "typing" | "image_guess") {
  if (practiceState.loadingPracticeData.value) return;
  const started = await practiceHandle.startPracticeByDate(mode, selectedTabId.value);
  if (started) practiceHandle.startPracticeSession();
}

function backToSetup() {
  practiceState.showDateSelection.value = false;
  practiceState.selectedDate.value = null;
  practiceHandle.practiceError.value = "";
}

function backToModes() {
  practiceHandle.backToModeSelection();
  selectedMode.value = null;
  practiceHandle.practiceError.value = "";
}

async function confirmExit() {
  await practiceHandle.handleConfirmExit();
  selectedMode.value = null;
  practiceHandle.practiceError.value = "";
}

onMounted(() => {
  void loadPracticeTabs();
});
</script>
