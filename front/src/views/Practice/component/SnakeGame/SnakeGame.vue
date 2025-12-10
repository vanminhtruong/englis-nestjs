<template>
  <div class="snake-container">
    <!-- Game Header -->
    <div class="game-header">
      <button @click="$emit('back')" class="back-button">
        <svg
          class="back-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Back
      </button>

      <div class="game-stats">
        <div class="stat-item score">
          <span class="stat-icon">🏆</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat-item target">
          <span class="stat-icon">🎯</span>
          <span class="stat-value">{{ currentWord?.word || "..." }}</span>
        </div>
      </div>
    </div>

    <!-- Game Container -->
    <div
      class="relative group rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-300"
      :class="isDarkMode ? 'border-white/10' : 'border-black/10'"
    >
      <canvas
        ref="canvasRef"
        :width="800"
        :height="500"
        class="block w-full h-full max-w-full max-h-[80vh] object-contain cursor-none"
      ></canvas>

      <!-- Start Overlay -->
      <div
        v-if="!gameState.isStarted"
        class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10"
      >
        <div class="relative mb-8 group">
          <div
            class="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
          ></div>
          <h3
            class="relative text-6xl font-black text-white tracking-tighter drop-shadow-2xl"
          >
            SNAKE GAME
          </h3>
        </div>

        <p class="text-gray-300 mb-8 text-lg font-light tracking-wide">
          Use <span class="font-bold text-emerald-400">Arrow Keys</span> to
          control the snake
        </p>

        <button
          @click="startGame"
          class="relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-200 overflow-hidden group"
        >
          <span class="relative z-10 flex items-center gap-2">
            <span>START GAME</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <div
            class="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-emerald-500/30"
          ></div>
        </button>
      </div>

      <!-- Current Word Overlay (Floating) -->
      <div
        v-if="currentWord && gameState.isStarted"
        class="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 pointer-events-none"
      >
        <span class="text-2xl font-bold text-white">{{
          currentWord.word
        }}</span>
        <span
          v-if="currentWord.pronunciation"
          class="ml-2 text-sm text-gray-400 font-mono"
        >
          /{{ currentWord.pronunciation }}/
        </span>
      </div>
    </div>

    <!-- Controls Hint -->
    <div class="mt-6 flex gap-4 text-sm text-gray-500">
      <div class="flex items-center gap-2">
        <kbd class="px-2 py-1 bg-white/10 rounded-md font-mono text-white"
          >↑</kbd
        >
        <kbd class="px-2 py-1 bg-white/10 rounded-md font-mono text-white"
          >↓</kbd
        >
        <kbd class="px-2 py-1 bg-white/10 rounded-md font-mono text-white"
          >←</kbd
        >
        <kbd class="px-2 py-1 bg-white/10 rounded-md font-mono text-white"
          >→</kbd
        >
        <span>to Move</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watch } from "vue";
import { GameEngine } from "./engine/GameEngine";
import { GameConfig, Vocabulary } from "./types";

const props = defineProps<{
  questions: any[];
}>();

const emit = defineEmits(["back", "complete"]);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const engine = ref<GameEngine | null>(null);
const score = ref(0);
const currentWord = ref<Vocabulary | null>(null);

const gameState = reactive({
  isStarted: false,
  isGameOver: false,
});

const isDarkMode = ref(document.documentElement.classList.contains("dark"));

const config: GameConfig = reactive({
  gridSize: 20,
  speed: 10,
  canvasWidth: 800,
  canvasHeight: 500,
  colors: {
    snakeHead: "#10B981", // emerald-500
    snakeBody: "#34D399", // emerald-400
    foodCorrect: "#3B82F6", // blue-500
    foodIncorrect: "#EF4444", // red-500
    text: "#FFFFFF",
    background: "#09090b", // zinc-950
    grid: "#27272a", // zinc-800
  },
});

let observer: MutationObserver | null = null;

function updateThemeColors() {
  const dark = document.documentElement.classList.contains("dark");
  isDarkMode.value = dark;

  if (dark) {
    config.colors = {
      snakeHead: "#10B981",
      snakeBody: "#34D399",
      foodCorrect: "#3B82F6",
      foodIncorrect: "#EF4444",
      text: "#FFFFFF",
      background: "transparent",
      grid: "#27272a",
    };
  } else {
    config.colors = {
      snakeHead: "#059669",
      snakeBody: "#10B981",
      foodCorrect: "#2563EB",
      foodIncorrect: "#DC2626",
      text: "#1F2937", // gray-800
      background: "transparent",
      grid: "#e2e8f0", // slate-200
    };
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);

  // Initial theme setup
  updateThemeColors();

  // Observe theme changes
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        updateThemeColors();
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  if (canvasRef.value) {
    const vocabularies: Vocabulary[] = props.questions.map((q) => ({
      vocabularyId: q.vocabularyId,
      word: q.word,
      meaning: q.meaning,
      pronunciation: q.pronunciation,
      image: q.image,
    }));

    engine.value = new GameEngine(canvasRef.value, config, vocabularies, {
      onGameOver: (results) => {
        gameState.isGameOver = true;
        gameState.isStarted = false;
        emit("complete", results);
      },
      onScoreUpdate: (newScore) => {
        score.value = newScore;
      },
      onWordChange: (word) => {
        currentWord.value = word;
      },
    });
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (engine.value) {
    engine.value.stop();
  }
  if (observer) {
    observer.disconnect();
  }
});

function handleKeydown(e: KeyboardEvent) {
  if (!gameState.isStarted) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    if (engine.value) {
      engine.value.handleInput(e.key);
    }
  }
}

function startGame() {
  gameState.isStarted = true;
  gameState.isGameOver = false;
  if (engine.value) {
    engine.value.start();
  }
}
</script>

<style scoped>
.snake-container {
  position: relative;
  width: 100%;
  min-height: 600px;
  height: calc(100vh - 200px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

:deep(.dark) .snake-container,
.dark .snake-container {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dark .game-header {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  color: #334155;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark .back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateX(-3px);
}

.dark .back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.back-icon {
  width: 18px;
  height: 18px;
}

.game-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2rem;
  font-weight: 600;
  color: #334155;
}

.dark .stat-item {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.stat-item.score {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-item.target {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #2563eb;
}

.dark .stat-item.target {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
}
</style>
