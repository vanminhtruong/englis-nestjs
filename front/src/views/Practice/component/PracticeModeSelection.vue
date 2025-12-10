<template>
  <div class="practice-modes-container">
    <div class="modes-header">
      <h2 class="modes-title">
        <span class="title-icon">🎯</span>
        {{ t("practice.modes") }}
      </h2>
      <p class="modes-subtitle">
        {{ t("practice.modesSubtitle") }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loadingModes" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">
        {{ t("practice.loadingModes") || "Preparing your practice modes..." }}
      </p>
    </div>

    <!-- Practice Modes Grid -->
    <div v-else-if="practiceModes.length > 0" class="modes-grid">
      <button
        v-for="(mode, index) in practiceModes"
        :key="mode.id"
        @click="handleModeClick(mode)"
        :disabled="loadingPracticeData"
        class="mode-card"
        :class="[
          `mode-${mode.key}`,
          { 'is-loading': loadingPracticeData && selectedMode === mode.key },
        ]"
        :style="{ '--delay': `${index * 0.1}s` }"
      >
        <!-- Animated Background -->
        <div class="card-bg">
          <div class="bg-gradient"></div>
          <div class="bg-pattern"></div>
          <div class="bg-glow"></div>
        </div>

        <!-- Card Content -->
        <div class="card-content">
          <!-- Icon Container -->
          <div class="icon-container">
            <div class="icon-bg"></div>
            <span class="mode-icon">{{ getModeIcon(mode.key) }}</span>
            <div class="icon-ring"></div>
          </div>

          <!-- Text Content -->
          <div class="text-content">
            <h3 class="mode-name">{{ getModeName(mode.name) }}</h3>
            <p class="mode-description">
              {{ getModeDescription(mode.description) }}
            </p>
          </div>

          <!-- Arrow / Loading Indicator -->
          <div class="action-indicator">
            <div
              v-if="loadingPracticeData && selectedMode === mode.key"
              class="mini-spinner"
            ></div>
            <svg
              v-else
              class="arrow-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- Hover Particles -->
        <div class="particles">
          <span v-for="n in 6" :key="n" class="particle"></span>
        </div>
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="modesLoaded && practiceModes.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">📭</div>
      <h3 class="empty-title">{{ t("practice.noVocabulary") }}</h3>
      <p class="empty-description">
        {{ t("practice.addVocabularyFirst") }}
      </p>
      <button @click="emit('retry-loading')" class="retry-button">
        <span class="retry-icon">🔄</span>
        {{ t("practice.tryAgain") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface PracticeModeItem {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const props = defineProps<{
  practiceModes: PracticeModeItem[];
  loadingModes: boolean;
  modesLoaded: boolean;
  loadingPracticeData: boolean;
}>();

const emit = defineEmits<{
  (e: "mode-click", mode: PracticeModeItem): void;
  (e: "retry-loading"): void;
}>();

const selectedMode = ref<string | null>(null);

function handleModeClick(mode: PracticeModeItem) {
  selectedMode.value = mode.key;
  emit("mode-click", mode);
}

const MODE_ICONS: Record<string, string> = {
  flashcard: "🃏",
  typing: "⌨️",
  image_guess: "🖼️",
  practice_by_date: "📅",
  multiple_choice: "📝",
  listening: "🎧",
  ball_shooting: "🎯",
  snake: "🐍",
};

function getModeIcon(key: string): string {
  return MODE_ICONS[key] || "🎯";
}

// Translation keys mapping for mode names
const MODE_NAME_KEYS: Record<string, string> = {
  flashcard: "practice.flashcard",
  typing: "practice.typing",
  practiceByDateMode: "practice.practiceByDateMode",
  imageGuess: "practice.imageGuess",
  multipleChoice: "practice.multipleChoice",
  listening: "practice.listening",
  ballShooting: "practice.ballShooting",
  snake: "practice.snakeGame",
};

// Translation keys mapping for mode descriptions
const MODE_DESC_KEYS: Record<string, string> = {
  flashcard: "practice.modeDescriptions.flashcard",
  typing: "practice.modeDescriptions.typing",
  practiceByDate: "practice.modeDescriptions.practiceByDate",
  imageGuess: "practice.modeDescriptions.imageGuess",
  multipleChoice: "practice.modeDescriptions.multipleChoice",
  listening: "practice.modeDescriptions.listening",
  ballShooting: "practice.modeDescriptions.ballShooting",
  snake: "practice.modeDescriptions.snakeGame",
};

function getModeName(nameKey: string): string {
  const translationKey = MODE_NAME_KEYS[nameKey];
  if (translationKey) {
    return t(translationKey);
  }
  return nameKey;
}

function getModeDescription(descKey: string): string {
  const translationKey = MODE_DESC_KEYS[descKey];
  if (translationKey) {
    return t(translationKey);
  }
  return descKey;
}
</script>

<style scoped>
.practice-modes-container {
  padding: 1rem;
}

/* Header Styles */
.modes-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.modes-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.title-icon {
  font-size: 1.75rem;
  -webkit-text-fill-color: initial;
}

.modes-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  font-weight: 400;
}

:root:not(.dark) .modes-subtitle {
  color: rgba(0, 0, 0, 0.5);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #667eea;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  inset: 8px;
  border-right-color: #764ba2;
  animation-delay: 0.15s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  inset: 16px;
  border-bottom-color: #f093fb;
  animation-delay: 0.3s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  animation: pulse 2s ease-in-out infinite;
}

:root:not(.dark) .loading-text {
  color: rgba(0, 0, 0, 0.6);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Modes Grid */
.modes-grid {
  display: grid;
  gap: 1.25rem;
}

/* Mode Card */
.mode-card {
  position: relative;
  border: none;
  border-radius: 1.25rem;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  padding: 0;
  min-height: 100px;
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: slideIn 0.6s ease-out backwards;
  animation-delay: var(--delay);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.mode-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3),
    0 0 30px -5px var(--glow-color, rgba(102, 126, 234, 0.4));
}

.mode-card:active {
  transform: translateY(-2px) scale(0.99);
}

.mode-card:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.mode-card:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Card Background */
.card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  transition: opacity 0.4s ease;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
      circle at 20% 80%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 50%
    );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.mode-card:hover .bg-pattern {
  opacity: 1;
}

.bg-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%
  );
  opacity: 0;
  transform: translate(-100%, -100%);
  transition: opacity 0.4s ease;
}

.mode-card:hover .bg-glow {
  opacity: 1;
  animation: glowMove 3s ease-in-out infinite;
}

@keyframes glowMove {
  0%,
  100% {
    transform: translate(-30%, -30%);
  }
  50% {
    transform: translate(30%, 30%);
  }
}

/* Mode-specific gradients */
.mode-flashcard .bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.mode-flashcard {
  --glow-color: rgba(102, 126, 234, 0.5);
}

.mode-typing .bg-gradient {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
}
.mode-typing {
  --glow-color: rgba(168, 85, 247, 0.5);
}

.mode-practice_by_date .bg-gradient {
  background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
}
.mode-practice_by_date {
  --glow-color: rgba(249, 115, 22, 0.5);
}

.mode-image_guess .bg-gradient {
  background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
}
.mode-image_guess {
  --glow-color: rgba(236, 72, 153, 0.5);
}

.mode-multiple_choice .bg-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}
.mode-multiple_choice {
  --glow-color: rgba(59, 130, 246, 0.5);
}

.mode-listening .bg-gradient {
  background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
}
.mode-listening {
  --glow-color: rgba(34, 197, 94, 0.5);
}

.mode-ball_shooting .bg-gradient {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
}
.mode-ball_shooting {
  --glow-color: rgba(6, 182, 212, 0.5);
}

.mode-snake .bg-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.mode-snake {
  --glow-color: rgba(16, 185, 129, 0.5);
}

/* Card Content */
.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
}

/* Icon Container */
.icon-container {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.mode-card:hover .icon-bg {
  transform: rotate(8deg) scale(1.05);
  background: rgba(255, 255, 255, 0.25);
}

.mode-icon {
  position: relative;
  font-size: 2rem;
  z-index: 1;
  transition: transform 0.3s ease;
}

.mode-card:hover .mode-icon {
  transform: scale(1.15);
  animation: iconBounce 0.6s ease;
}

@keyframes iconBounce {
  0%,
  100% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(1.25);
  }
}

.icon-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 1.25rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.mode-card:hover .icon-ring {
  opacity: 1;
  transform: scale(1);
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Text Content */
.text-content {
  flex: 1;
  min-width: 0;
}

.mode-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.35rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.mode-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  line-height: 1.4;
}

/* Action Indicator */
.action-indicator {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.mode-card:hover .action-indicator {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: white;
  transition: transform 0.3s ease;
}

.mode-card:hover .arrow-icon {
  transform: translateX(3px);
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Particles */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  opacity: 0;
}

.mode-card:hover .particle {
  animation: particleFloat 2s ease-in-out infinite;
}

.particle:nth-child(1) {
  left: 10%;
  top: 20%;
  animation-delay: 0s;
}
.particle:nth-child(2) {
  left: 20%;
  top: 80%;
  animation-delay: 0.2s;
}
.particle:nth-child(3) {
  left: 60%;
  top: 10%;
  animation-delay: 0.4s;
}
.particle:nth-child(4) {
  left: 80%;
  top: 70%;
  animation-delay: 0.6s;
}
.particle:nth-child(5) {
  left: 40%;
  top: 90%;
  animation-delay: 0.8s;
}
.particle:nth-child(6) {
  left: 90%;
  top: 40%;
  animation-delay: 1s;
}

@keyframes particleFloat {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1.5rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

:root:not(.dark) .empty-state {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
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

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

:root:not(.dark) .empty-title {
  color: #1a1a2e;
}

.empty-description {
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 1.5rem 0;
}

:root:not(.dark) .empty-description {
  color: rgba(0, 0, 0, 0.5);
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.5);
}

.retry-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.retry-button:hover .retry-icon {
  animation: rotateIcon 0.6s ease;
}

@keyframes rotateIcon {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (min-width: 768px) {
  .modes-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modes-title {
    font-size: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .mode-card {
    min-height: 120px;
  }

  .card-content {
    padding: 2rem;
  }

  .icon-container {
    width: 72px;
    height: 72px;
  }

  .mode-icon {
    font-size: 2.25rem;
  }

  .mode-name {
    font-size: 1.4rem;
  }
}
</style>
