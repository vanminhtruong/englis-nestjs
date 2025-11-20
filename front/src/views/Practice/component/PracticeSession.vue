<template>
  <div class="space-y-6">
    <!-- Back Button and Header -->
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="emit('show-exit-confirm')"
        class="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h2 class="text-2xl font-bold text-black dark:text-white">
        <span v-if="session.mode === 'flashcard'">
          {{ t("practice.flashcard") }}
        </span>
        <span v-else-if="session.mode === 'typing'">
          {{ t("practice.typing") }}
        </span>
        <span v-else-if="session.mode === 'image_guess'">
          {{ t("practice.imageGuess") }}
        </span>
        <span>
          {{ " " + (t("practice.practice") || "Practice") }}
        </span>
      </h2>
    </div>

    <!-- Progress and Timer -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex-1">
        <div
          class="bg-black/20 dark:bg-white/20 rounded-full h-3 overflow-hidden"
        >
          <div
            class="bg-gradient-to-r from-primary-500 to-secondary-500 h-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="text-center text-black/60 dark:text-white/60 mt-2">
          Question {{ session.currentIndex + 1 }} /
          {{ session.questions.length }}
        </div>
      </div>
      <div class="ml-6 text-center">
        <div
          :class="{
            'text-3xl font-bold': true,
            'text-green-500': timeLeft > 10,
            'text-yellow-500': timeLeft <= 10 && timeLeft > 5,
            'text-red-500': timeLeft <= 5,
          }"
        >
          {{ timeLeft }}s
        </div>
        <div class="text-sm text-black/60 dark:text-white/60">
          {{ t("practice.timeLeft") }}
        </div>
      </div>
    </div>

    <!-- Question Card -->
    <div
      v-if="currentQuestion"
      class="bg-gradient-to-br from-white to-white/50 dark:from-white/5 dark:to-black border border-black/10 dark:border-white/10 rounded-3xl p-8"
    >
      <div class="text-center mb-8">
        <!-- For image_guess mode, highlight image first -->
        <div
          v-if="session.mode === 'image_guess'"
          class="mb-6 flex flex-col items-center gap-4"
        >
          <div
            class="w-full max-w-md h-56 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center"
          >
            <template v-if="currentQuestion.image">
              <img
                :src="
                  currentQuestion.image.startsWith('data:') ||
                  currentQuestion.image.startsWith('http')
                    ? currentQuestion.image
                    : `${API_URL}${currentQuestion.image}`
                "
                :alt="currentQuestion.word"
                class="w-full h-full object-contain"
              />
            </template>
            <template v-else>
              <div class="text-center text-black/40 dark:text-white/40">
                🖼️
                <div class="text-sm mt-1">No image available</div>
              </div>
            </template>
          </div>
        </div>

        <!-- Word + pronunciation (hide for image_guess mode) -->
        <div v-if="session.mode !== 'image_guess'">
          <h3 class="text-5xl font-bold text-black dark:text-white mb-4">
            {{ currentQuestion.word }}
          </h3>
          <p class="text-xl text-black/50 dark:text-white/50">
            {{ currentQuestion.pronunciation }}
          </p>
        </div>
      </div>

      <!-- Flashcard Mode: Click to reveal -->
      <div v-if="session.mode === 'flashcard' && !showAnswer" class="space-y-4">
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🎴</div>
          <p class="text-lg text-black/70 dark:text-white/70 mb-6">
            {{ t("practice.clickToReveal") || "Click to reveal the meaning" }}
          </p>
          <button
            @click="emit('reveal-answer')"
            class="py-4 px-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            {{ t("practice.reveal") || "Reveal Answer" }}
          </button>
        </div>
      </div>

      <!-- Typing Mode: Input answer -->
      <div
        v-else-if="session.mode === 'typing' && !showAnswer"
        class="space-y-4"
      >
        <label
          class="block text-lg font-medium text-black/70 dark:text-white/70 text-center"
        >
          {{ t("practice.typeTheWord") }}
        </label>
        <input
          v-model="localUserAnswer"
          type="text"
          @keyup.enter="emit('submit-answer', localUserAnswer)"
          class="w-full px-6 py-4 text-lg rounded-xl border-2 border-black/20 dark:border-white/20 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
          placeholder="Your answer..."
          autofocus
        />
        <button
          @click="emit('submit-answer', localUserAnswer)"
          class="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t("practice.submit") }}
        </button>
      </div>

      <!-- Image Guess Mode: Letter boxes with hints -->
      <div
        v-else-if="session.mode === 'image_guess' && !showAnswer"
        class="space-y-6"
      >
        <label
          class="block text-lg font-medium text-black/70 dark:text-white/70 text-center"
        >
          {{
            t("practice.guessFromImage") || "Guess the word from the picture"
          }}
        </label>

        <!-- Letter boxes - directly editable -->
        <div
          class="flex flex-wrap justify-center gap-2"
          @click="focusHiddenInput"
        >
          <div
            v-for="(letter, index) in getLetterBoxes()"
            :key="index"
            :class="{
              'w-4': letter.originalLetter === ' ',
              'w-12 h-12 border-2 border-black/20 dark:border-white/20 rounded-lg flex items-center justify-center bg-white dark:bg-white/5 text-xl font-bold text-black dark:text-white cursor-text':
                letter.originalLetter !== ' ',
              'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-600':
                letter.isHint,
              'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600':
                letter.isUserInput,
              'animate-pulse':
                letter.originalLetter !== ' ' &&
                !letter.isHint &&
                !letter.isUserInput,
            }"
          >
            {{ letter.display }}
          </div>
        </div>

        <!-- Hidden input for capturing keyboard input -->
        <input
          ref="hiddenInput"
          v-model="localUserAnswer"
          type="text"
          @input="updateLetterBoxes"
          @keyup.enter="emit('submit-answer', buildCompleteAnswer())"
          class="sr-only"
          :maxlength="maxInputLength"
          autofocus
        />

        <div class="text-center text-sm text-black/50 dark:text-white/50">
          {{
            t("practice.clickToType") || "Click on the boxes and start typing"
          }}
        </div>

        <button
          @click="emit('submit-answer', buildCompleteAnswer())"
          class="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t("practice.submit") }}
        </button>
      </div>

      <!-- Answer Result -->
      <div v-else class="space-y-6">
        <!-- Flashcard Mode: Show meaning and ask if correct -->
        <div v-if="session.mode === 'flashcard'">
          <div class="text-center mb-6">
            <div
              class="text-3xl font-bold text-primary-500 dark:text-primary-400 mb-4"
            >
              {{ currentQuestion.meaning }}
            </div>
            <div
              v-if="currentQuestion.example"
              class="p-4 bg-black/5 dark:bg-white/5 rounded-xl"
            >
              <p class="text-sm italic text-black/60 dark:text-white/60">
                {{ currentQuestion.example }}
              </p>
            </div>
          </div>

          <div class="text-center mb-4">
            <p class="text-lg text-black/70 dark:text-white/70 mb-4">
              {{ t("practice.didYouKnow") || "Did you know this?" }}
            </p>
            <div class="flex gap-4 justify-center">
              <button
                @click="emit('flashcard-answer', true)"
                class="px-8 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all"
              >
                ✓ {{ t("practice.iKnew") || "I Knew" }}
              </button>
              <button
                @click="emit('flashcard-answer', false)"
                class="px-8 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all"
              >
                ✗ {{ t("practice.iDidntKnow") || "I Didn't Know" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Typing Mode: Show result -->
        <div v-else>
          <div class="text-center">
            <div
              :class="{
                'text-green-600 dark:text-green-400': session.answers.get(
                  currentQuestion.vocabularyId
                )?.isCorrect,
                'text-red-600 dark:text-red-400': !session.answers.get(
                  currentQuestion.vocabularyId
                )?.isCorrect,
              }"
              class="text-2xl font-bold mb-2"
            >
              {{
                session.answers.get(currentQuestion.vocabularyId)?.isCorrect
                  ? "✓ " + t("practice.correct")
                  : "✗ " + t("practice.incorrect")
              }}
            </div>
          </div>

          <div>
            <div class="space-y-3">
              <div>
                <span class="font-semibold text-black/70 dark:text-white/70"
                  >{{ t("practice.yourAnswer") }}:</span
                >
                <span class="ml-2 text-black dark:text-white">{{
                  userAnswer
                }}</span>
              </div>
              <div>
                <span class="font-semibold text-black/70 dark:text-white/70"
                  >{{ t("practice.correctAnswer") }}:</span
                >
                <span class="ml-2 text-black dark:text-white">{{
                  currentQuestion.meaning
                }}</span>
              </div>
              <div
                v-if="currentQuestion.example"
                class="pt-3 border-t border-black/20 dark:border-white/20"
              >
                <p class="text-sm italic text-black/60 dark:text-white/60">
                  {{ currentQuestion.example }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="!isLastQuestion"
          @click="emit('next-question')"
          class="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t("practice.next") }}
        </button>
        <button
          v-else
          @click="emit('restart')"
          class="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          {{ t("practice.finish") }}
        </button>
      </div>
    </div>

    <!-- Timeout Modal -->
    <TimeoutModal
      :show="showTimeoutModal"
      :correct-answer="currentQuestion?.meaning || ''"
      @close="emit('back')"
      @restart="emit('restart')"
    />

    <!-- Session Summary (shown when finished) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isLastQuestion && showAnswer"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div
          class="bg-gradient-to-br from-white to-white/50 dark:from-white/5 dark:to-black border border-black/10 dark:border-white/10 rounded-3xl p-8 text-center max-w-lg w-full"
        >
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-3xl font-bold text-black dark:text-white mb-2">
            {{ t("practice.congratulations") }}
          </h2>
          <p class="text-black/60 dark:text-white/60 mb-6">
            {{ t("practice.practiceComplete") }}
          </p>
          <div class="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {{ totalCorrect }}
              </div>
              <div class="text-sm text-black/60 dark:text-white/60">
                {{ t("practice.correctAnswers") }}
              </div>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div
                class="text-3xl font-bold text-purple-600 dark:text-purple-400"
              >
                {{ totalScore }}
              </div>
              <div class="text-sm text-black/60 dark:text-white/60">
                {{ t("practice.score") }}
              </div>
            </div>
          </div>
          <button
            @click="emit('restart')"
            class="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            {{ t("practice.backToMenu") || t("practice.finish") }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  defineAsyncComponent,
  onMounted,
  nextTick,
} from "vue";
import { useI18n } from "vue-i18n";
import { API_URL } from "../../../services/api.service";

const TimeoutModal = defineAsyncComponent(() => import("./TimeoutModal.vue"));
const { t } = useI18n();

const props = defineProps<{
  session: any;
  currentQuestion: any;
  progress: number;
  timeLeft: number;
  showAnswer: boolean;
  userAnswer: string;
  hasAnsweredQuestion: boolean;
  isLastQuestion: boolean;
  totalCorrect: number;
  totalScore: number;
  showTimeoutModal: boolean;
}>();

const emit = defineEmits<{
  (e: "back"): void;
  (e: "show-exit-confirm"): void;
  (e: "reveal-answer"): void;
  (e: "flashcard-answer", known: boolean): void;
  (e: "submit-answer", value: string): void;
  (e: "restart"): void;
  (e: "next-question"): void;
}>();

const localUserAnswer = ref(props.userAnswer);
watch(
  () => props.userAnswer,
  (v) => (localUserAnswer.value = v)
);

const hiddenInput = ref<HTMLInputElement | null>(null);

// Calculate max length for user input (excluding hints and spaces)
const maxInputLength = computed(() => {
  if (!props.currentQuestion?.meaning) return 20;

  const meaning = props.currentQuestion.meaning.toLowerCase();
  const hintPositions = getHintPositions(meaning);
  let count = 0;

  for (let i = 0; i < meaning.length; i++) {
    const char = meaning[i];
    if (char !== " " && !hintPositions.includes(i)) {
      count++;
    }
  }

  return count;
});

function focusHiddenInput() {
  if (hiddenInput.value) {
    hiddenInput.value.focus();
  }
}

// Auto focus for image_guess mode
onMounted(() => {
  if (props.session.mode === "image_guess") {
    nextTick(() => {
      focusHiddenInput();
    });
  }
});

// Watch for question changes and re-focus
watch(
  () => props.currentQuestion,
  () => {
    if (props.session.mode === "image_guess" && !props.showAnswer) {
      nextTick(() => {
        focusHiddenInput();
      });
    }
  }
);

// Watch for showAnswer changes and re-focus when it becomes false
watch(
  () => props.showAnswer,
  (newVal) => {
    if (!newVal && props.session.mode === "image_guess") {
      nextTick(() => {
        focusHiddenInput();
      });
    }
  }
);

// Image guess letter boxes logic
interface LetterBox {
  display: string;
  isHint: boolean;
  isUserInput: boolean;
  originalLetter: string;
}

function getLetterBoxes(): LetterBox[] {
  if (!props.currentQuestion?.meaning) return [];

  const meaning = props.currentQuestion.meaning.toLowerCase();
  const userInput = localUserAnswer.value.toLowerCase();
  const boxes: LetterBox[] = [];

  // Generate hint positions (max 2 letters)
  const hintPositions = getHintPositions(meaning);

  let userInputIndex = 0; // Separate index for userInput

  for (let i = 0; i < meaning.length; i++) {
    const char = meaning[i];

    if (char === " ") {
      // Space between words
      boxes.push({
        display: "",
        isHint: false,
        isUserInput: false,
        originalLetter: " ",
      });
    } else {
      const isHint = hintPositions.includes(i);

      if (isHint) {
        // This is a hint position, show the original character
        boxes.push({
          display: char.toUpperCase(),
          isHint: true,
          isUserInput: false,
          originalLetter: char,
        });
      } else {
        // This is a position for user input
        const userChar = userInput[userInputIndex] || "";
        const hasUserInput = userChar && userChar !== " ";

        boxes.push({
          display: hasUserInput ? userChar.toUpperCase() : "",
          isHint: false,
          isUserInput: hasUserInput,
          originalLetter: char,
        });

        userInputIndex++; // Only increment for non-hint positions
      }
    }
  }

  return boxes;
}

function getHintPositions(word: string): number[] {
  const positions: number[] = [];
  const words = word.split(" ");
  let currentPos = 0;

  // For each word, add hint for first letter
  for (let wordIndex = 0; wordIndex < Math.min(words.length, 2); wordIndex++) {
    const currentWord = words[wordIndex];
    if (currentWord.length > 0) {
      positions.push(currentPos); // First letter of each word (max 2 words)
    }
    currentPos += currentWord.length + 1; // +1 for space
  }

  return positions;
}

function updateLetterBoxes() {
  // This function is called when user types, triggering reactivity
  // The computed getLetterBoxes() will automatically update
}

// Build complete answer for image_guess mode by combining hints and user input
function buildCompleteAnswer(): string {
  if (props.session.mode !== "image_guess" || !props.currentQuestion?.meaning) {
    return localUserAnswer.value;
  }

  const meaning = props.currentQuestion.meaning.toLowerCase();
  const userInput = localUserAnswer.value.toLowerCase();
  const hintPositions = getHintPositions(meaning);
  let result = "";
  let userInputIndex = 0;

  for (let i = 0; i < meaning.length; i++) {
    const char = meaning[i];

    if (char === " ") {
      result += " ";
    } else if (hintPositions.includes(i)) {
      // This position is a hint, use original character
      result += char;
    } else {
      // This position should be filled by user
      result += userInput[userInputIndex] || "";
      userInputIndex++;
    }
  }

  return result;
}
</script>
