<template>
  <div class="ball-shooting-container">
    <!-- Game Header -->
    <div class="game-header">
      <button @click="handleBack" class="back-button">
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
        {{ t("practice.backToMenu") }}
      </button>

      <div class="game-stats">
        <div class="stat-item score">
          <span class="stat-icon">🏆</span>
          <span class="stat-value">{{ gameState.score }}</span>
        </div>
        <div
          class="stat-item combo"
          :class="{ active: gameState.comboCount >= 2 }"
        >
          <span class="stat-icon">🔥</span>
          <span class="stat-value">x{{ gameState.comboCount }}</span>
        </div>
        <div class="stat-item lives">
          <span
            v-for="i in 3"
            :key="i"
            class="heart"
            :class="{ lost: i > gameState.lives }"
          >
            {{ i <= gameState.lives ? "❤️" : "🖤" }}
          </span>
        </div>
        <div
          class="stat-item timer"
          :class="{ warning: gameState.timeRemaining <= 10 }"
        >
          <span class="stat-icon">⏱️</span>
          <span class="stat-value">{{
            formatTime(gameState.timeRemaining)
          }}</span>
        </div>
      </div>
    </div>

    <!-- Current Question Display -->
    <div class="question-display" :class="{ shake: showWrongEffect }">
      <div class="question-label">{{ t("practice.whatIsMeaning") }}</div>
      <div class="question-meaning">{{ gameState.currentMeaning }}</div>
      <div class="hint-text">
        {{
          t("practice.clickToType") || "Click the ball with the correct word!"
        }}
      </div>
    </div>

    <!-- Game Canvas -->
    <div class="canvas-container" ref="canvasContainer">
      <canvas
        ref="gameCanvas"
        @click="handleCanvasClick"
        @touchstart="handleTouchStart"
        class="game-canvas"
      ></canvas>

      <!-- Overlay Effects -->
      <div class="overlay-effects">
        <!-- Combo Popup -->
        <Transition name="combo-pop">
          <div v-if="showCombo" class="combo-popup">
            <span class="combo-text">{{ comboText }}</span>
            <span class="combo-multiplier">x{{ lastCombo }}</span>
          </div>
        </Transition>

        <!-- Score Popup -->
        <Transition name="score-fly">
          <div
            v-if="showScorePopup"
            class="score-popup"
            :style="scorePopupStyle"
          >
            +{{ lastScore }}
          </div>
        </Transition>

        <!-- Level Up -->
        <Transition name="level-up">
          <div v-if="showLevelUp" class="level-up-popup">
            <span class="level-text">LEVEL UP!</span>
            <span class="level-number">{{ gameState.level }}</span>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Game Over Modal -->
    <Transition name="modal">
      <div v-if="showGameOver" class="game-over-overlay">
        <div class="game-over-modal">
          <div class="modal-header">
            <span class="trophy-icon">🏆</span>
            <h2 class="modal-title">{{ t("practice.congratulations") }}</h2>
          </div>

          <div class="results-grid">
            <div class="result-item">
              <span class="result-label">{{ t("practice.totalScore") }}</span>
              <span class="result-value score-value">{{
                gameState.score
              }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">{{ t("practice.accuracy") }}</span>
              <span class="result-value">{{ calculateAccuracy() }}%</span>
            </div>
            <div class="result-item">
              <span class="result-label">Max Combo</span>
              <span class="result-value">x{{ gameState.maxCombo }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">{{
                t("practice.correctAnswers")
              }}</span>
              <span class="result-value"
                >{{ correctCount }}/{{ totalAnswered }}</span
              >
            </div>
          </div>

          <div class="modal-actions">
            <button @click="restartGame" class="action-button restart">
              <span>🔄</span> {{ t("practice.tryAgain") }}
            </button>
            <button @click="handleBack" class="action-button back">
              <span>🏠</span> {{ t("practice.backToMenu") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Start Screen -->
    <Transition name="modal">
      <div v-if="!isGameStarted" class="start-overlay">
        <div class="start-modal">
          <div class="game-logo">🎯</div>
          <h2 class="game-title">
            {{ t("practice.ballShooting") || "Ball Shooting" }}
          </h2>
          <p class="game-description">
            {{
              t("practice.modeDescriptions.ballShooting") ||
              "Shoot the ball with the correct word!"
            }}
          </p>

          <div class="instructions">
            <div class="instruction-item">
              <span class="instruction-icon">👆</span>
              <span>{{
                t("practice.ballShootingHint1") ||
                "Click on balls to shoot them"
              }}</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">🎯</span>
              <span>{{
                t("practice.ballShootingHint2") ||
                "Match the word to the meaning shown"
              }}</span>
            </div>
            <div class="instruction-item">
              <span class="instruction-icon">🔥</span>
              <span>{{
                t("practice.ballShootingHint3") ||
                "Build combos for bonus points!"
              }}</span>
            </div>
          </div>

          <button @click="startGame" class="start-button">
            <span class="button-icon">🚀</span>
            {{ t("practice.startPractice") }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { GameEngine } from "./GameEngine";
import { GameRenderer } from "./GameRenderer";
import type { IGameEvent, IPracticeQuestion } from "./interfaces";

const { t } = useI18n();

// Props
const props = defineProps<{
  questions: IPracticeQuestion[];
}>();

// Emits
const emit = defineEmits<{
  (e: "back"): void;
  (e: "complete", results: any): void;
}>();

// Refs
const canvasContainer = ref<HTMLDivElement | null>(null);
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const gameEngine = ref<GameEngine | null>(null);
const gameRenderer = ref<GameRenderer | null>(null);
const renderLoopId = ref<number | null>(null);

// State
const isGameStarted = ref(false);
const showGameOver = ref(false);
const showCombo = ref(false);
const showScorePopup = ref(false);
const showLevelUp = ref(false);
const showWrongEffect = ref(false);
const comboText = ref("");
const lastCombo = ref(0);
const lastScore = ref(0);
const scorePopupStyle = ref({ left: "50%", top: "50%" });

const gameState = ref({
  balls: [],
  score: 0,
  lives: 3,
  level: 1,
  isPlaying: false,
  isPaused: false,
  currentMeaning: "",
  currentVocabularyId: "",
  timeRemaining: 60,
  comboCount: 0,
  maxCombo: 0,
});

const correctCount = ref(0);
const totalAnswered = ref(0);

// Initialize game
onMounted(() => {
  setupCanvas();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  cleanup();
  window.removeEventListener("resize", handleResize);
  if (observer) observer.disconnect();
});

let observer: MutationObserver | null = null;

function setupCanvas() {
  if (!canvasContainer.value || !gameCanvas.value) return;

  const container = canvasContainer.value;
  const canvas = gameCanvas.value;

  // Set canvas size
  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  // Detect dark mode initial state
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Setup Observer if not exists
  if (!observer) {
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isDark = document.documentElement.classList.contains("dark");

          if (gameEngine.value) {
            gameEngine.value.updateConfig({ isDarkMode: isDark });
          }

          if (gameRenderer.value) {
            gameRenderer.value.updateConfig({
              canvasWidth: rect.width, // Ensure dimensions are preserved
              canvasHeight: rect.height,
              isDarkMode: isDark,
            });
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  // Initialize game engine
  gameEngine.value = new GameEngine({
    canvasWidth: rect.width,
    canvasHeight: rect.height,
    maxBalls: 6,
    ballSpeed: 1.2,
    spawnInterval: 1800,
    gameTime: 60,
    isDarkMode,
  });

  // Initialize renderer
  gameRenderer.value = new GameRenderer(canvas, gameEngine.value.getConfig());

  // Add event listener
  gameEngine.value.addListener({
    onGameEvent: handleGameEvent,
  });
}

function handleResize() {
  if (!canvasContainer.value || !gameCanvas.value) return;

  const container = canvasContainer.value;
  const rect = container.getBoundingClientRect();

  if (gameEngine.value) {
    gameEngine.value.updateConfig({
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    });
  }

  if (gameRenderer.value) {
    gameRenderer.value.updateConfig({
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    });
  }

  setupCanvas();
}

function startGame() {
  if (!gameEngine.value || !props.questions.length) return;

  isGameStarted.value = true;
  showGameOver.value = false;
  correctCount.value = 0;
  totalAnswered.value = 0;

  gameEngine.value.initialize(props.questions);
  gameEngine.value.start();

  startRenderLoop();
}

function startRenderLoop() {
  const render = () => {
    if (!gameEngine.value || !gameRenderer.value) return;

    const state = gameEngine.value.getState();
    gameState.value = state;

    gameRenderer.value.render(state, gameEngine.value.getExplosionManager());

    if (state.isPlaying) {
      renderLoopId.value = requestAnimationFrame(render);
    }
  };

  render();
}

function handleGameEvent(event: IGameEvent) {
  switch (event.type) {
    case "ball_hit":
      handleBallHit(event.data);
      break;
    case "ball_miss":
      handleBallMiss(event.data);
      break;
    case "combo":
      handleCombo(event.data);
      break;
    case "level_up":
      handleLevelUp(event.data);
      break;
    case "game_over":
      handleGameOver(event.data);
      break;
  }
}

function handleBallHit(data: { ball: any; score: number; combo: number }) {
  lastScore.value = data.score;
  lastCombo.value = data.combo;
  correctCount.value++;
  totalAnswered.value++;

  // Add shooting effect animation
  if (gameRenderer.value) {
    const hitColor =
      data.combo >= 3 ? "#ff6b6b" : data.combo >= 2 ? "#ffa500" : "#ffd700";
    gameRenderer.value.addShootEffect(data.ball.x, data.ball.y, hitColor);
  }

  // Show score popup
  showScorePopup.value = true;
  scorePopupStyle.value = {
    left: `${data.ball.x}px`,
    top: `${data.ball.y}px`,
  };

  setTimeout(() => {
    showScorePopup.value = false;
  }, 800);
}

function handleBallMiss(data: { remainingLives: number }) {
  totalAnswered.value++;
  showWrongEffect.value = true;

  setTimeout(() => {
    showWrongEffect.value = false;
  }, 500);
}

function handleCombo(data: { count: number }) {
  const comboTexts = [
    "Nice!",
    "Great!",
    "Awesome!",
    "Amazing!",
    "Incredible!",
    "LEGENDARY!",
  ];
  comboText.value = comboTexts[Math.min(data.count - 2, comboTexts.length - 1)];
  lastCombo.value = data.count;
  showCombo.value = true;

  setTimeout(() => {
    showCombo.value = false;
  }, 1000);
}

function handleLevelUp(data: { level: number }) {
  showLevelUp.value = true;

  setTimeout(() => {
    showLevelUp.value = false;
  }, 1500);
}

function handleGameOver(data: any) {
  showGameOver.value = true;

  // Emit complete event with results
  emit("complete", {
    ...data,
    correctCount: correctCount.value,
    totalAnswered: totalAnswered.value,
  });
}

function handleCanvasClick(event: MouseEvent) {
  if (!gameEngine.value || !gameState.value.isPlaying) return;

  const canvas = gameCanvas.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  gameEngine.value.handleClick(x, y);
}

function handleTouchStart(event: TouchEvent) {
  event.preventDefault();

  if (!gameEngine.value || !gameState.value.isPlaying) return;

  const canvas = gameCanvas.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const touch = event.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  gameEngine.value.handleClick(x, y);
}

function restartGame() {
  showGameOver.value = false;
  startGame();
}

function handleBack() {
  cleanup();
  emit("back");
}

function cleanup() {
  if (renderLoopId.value !== null) {
    cancelAnimationFrame(renderLoopId.value);
  }
  if (gameEngine.value) {
    gameEngine.value.stop();
  }
  if (gameRenderer.value) {
    gameRenderer.value.destroy();
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function calculateAccuracy(): number {
  if (totalAnswered.value === 0) return 0;
  return Math.round((correctCount.value / totalAnswered.value) * 100);
}
</script>

<style scoped>
.ball-shooting-container {
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
}

:deep(.dark) .ball-shooting-container,
.dark .ball-shooting-container {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* Game Header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.dark .game-header {
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #1a1a2e;
}

.stat-item.combo {
  background: rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
}

.stat-item.combo.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  animation: pulse 0.5s ease infinite;
}

.stat-item.timer.warning {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.heart {
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.heart.lost {
  opacity: 0.3;
  transform: scale(0.9);
}

/* Question Display */
.question-display {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(
    180deg,
    rgba(102, 126, 234, 0.2) 0%,
    transparent 100%
  );
  transition: transform 0.1s ease;
}

.question-display.shake {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-10px);
  }
  40%,
  80% {
    transform: translateX(10px);
  }
}

.question-label {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
}

.dark .question-label {
  color: rgba(255, 255, 255, 0.6);
}

.question-meaning {
  font-size: 2rem;
  font-weight: 700;
  color: #334155;
  text-shadow: none;
  margin-bottom: 0.5rem;
}

.dark .question-meaning {
  color: white;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.hint-text {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.4);
}

.dark .hint-text {
  color: rgba(255, 255, 255, 0.4);
}

/* Canvas Container */
.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* Overlay Effects */
.overlay-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* Combo Popup */
.combo-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.combo-text {
  display: block;
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #ff8e53 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  animation: comboAppear 0.5s ease;
}

.combo-multiplier {
  display: block;
  font-size: 2rem;
  color: #ffd700;
  font-weight: 700;
}

@keyframes comboAppear {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.combo-pop-enter-active {
  animation: comboAppear 0.3s ease;
}
.combo-pop-leave-active {
  animation: comboAppear 0.3s ease reverse;
}

/* Score Popup */
.score-popup {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #4ade80;
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
  pointer-events: none;
}

.score-fly-enter-active {
  animation: scoreFly 0.8s ease-out;
}

@keyframes scoreFly {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(1.5);
  }
}

/* Level Up */
.level-up-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.level-text {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  color: #4ade80;
  text-shadow: 0 0 30px rgba(74, 222, 128, 0.8);
  animation: levelPulse 0.5s ease infinite;
}

.level-number {
  display: block;
  font-size: 4rem;
  font-weight: 900;
  color: white;
}

@keyframes levelPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.level-up-enter-active {
  animation: comboAppear 0.3s ease;
}
.level-up-leave-active {
  animation: comboAppear 0.3s ease reverse;
}

/* Modals */
.game-over-overlay,
.start-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 1rem;
}

.dark .game-over-overlay,
.dark .start-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.game-over-modal,
.start-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1.5rem;
  padding: 2.5rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.dark .game-over-modal,
.dark .start-modal {
  background: linear-gradient(135deg, #1a1a3e 0%, #2d2d5a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  margin-bottom: 1.5rem;
}

.trophy-icon,
.game-logo {
  font-size: 4rem;
  display: block;
  margin-bottom: 0.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.modal-title,
.game-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0;
}

.dark .modal-title,
.dark .game-title {
  color: white;
}

.game-description {
  color: rgba(0, 0, 0, 0.6);
  margin: 0.5rem 0 1.5rem;
}

.dark .game-description {
  color: rgba(255, 255, 255, 0.6);
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-item {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  padding: 1rem;
}

.dark .result-item {
  background: rgba(255, 255, 255, 0.05);
}

.result-label {
  display: block;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.25rem;
}

.dark .result-label {
  color: rgba(255, 255, 255, 0.5);
}

.result-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
}

.dark .result-value {
  color: white;
}

.result-value.score-value {
  color: #ffd700;
}

/* Instructions */
.instructions {
  margin-bottom: 1.5rem;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
  color: rgba(0, 0, 0, 0.7);
  font-size: 0.9rem;
}

.dark .instruction-item {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
}

.instruction-icon {
  font-size: 1.5rem;
}

/* Buttons */
.modal-actions {
  display: flex;
  gap: 1rem;
}

.action-button,
.start-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.restart,
.start-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.restart:hover,
.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.5);
}

.action-button.back {
  background: rgba(0, 0, 0, 0.05);
  color: #334155;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dark .action-button.back {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-button.back:hover {
  background: rgba(0, 0, 0, 0.1);
}

.dark .action-button.back:hover {
  background: rgba(255, 255, 255, 0.2);
}

.button-icon {
  font-size: 1.2rem;
}

/* Modal Transitions */
.modal-enter-active {
  animation: modalIn 0.3s ease;
}
.modal-leave-active {
  animation: modalIn 0.3s ease reverse;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
  }

  .game-stats {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .stat-item {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .question-meaning {
    font-size: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
