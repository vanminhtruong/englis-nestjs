<template>
  <div class="practice-stats-card">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
      {{ t("learningProgress.practice.title") }}
    </h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <!-- Flashcard -->
      <div class="practice-type-card">
        <div class="practice-icon bg-gradient-to-br from-blue-400 to-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M12 8v8" />
          </svg>
        </div>
        <span class="practice-count">{{ practiceStats.flashcardCount }}</span>
        <span class="practice-label">{{
          t("learningProgress.practice.flashcard")
        }}</span>
      </div>

      <!-- Multiple Choice -->
      <div class="practice-type-card">
        <div
          class="practice-icon bg-gradient-to-br from-purple-400 to-purple-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <span class="practice-count">{{
          practiceStats.multipleChoiceCount
        }}</span>
        <span class="practice-label">{{
          t("learningProgress.practice.multipleChoice")
        }}</span>
      </div>

      <!-- Typing -->
      <div class="practice-type-card">
        <div
          class="practice-icon bg-gradient-to-br from-emerald-400 to-emerald-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
          </svg>
        </div>
        <span class="practice-count">{{ practiceStats.typingCount }}</span>
        <span class="practice-label">{{
          t("learningProgress.practice.typing")
        }}</span>
      </div>

      <!-- Listening -->
      <div class="practice-type-card">
        <div
          class="practice-icon bg-gradient-to-br from-amber-400 to-amber-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
          </svg>
        </div>
        <span class="practice-count">{{ practiceStats.listeningCount }}</span>
        <span class="practice-label">{{
          t("learningProgress.practice.listening")
        }}</span>
      </div>
    </div>

    <!-- Accuracy Chart -->
    <div class="accuracy-section">
      <div class="accuracy-chart">
        <svg viewBox="0 0 100 100" class="w-32 h-32">
          <!-- Background circle -->
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            stroke-width="8"
            class="text-gray-200 dark:text-white/10"
          />
          <!-- Progress circle -->
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#accuracyGradient)"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="`${practiceStats.accuracy * 2.51} 251`"
            transform="rotate(-90 50 50)"
            class="accuracy-circle"
          />
          <defs>
            <linearGradient
              id="accuracyGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stop-color="#10B981" />
              <stop offset="100%" stop-color="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        <div class="accuracy-value">
          <span class="text-3xl font-bold text-gray-900 dark:text-white"
            >{{ practiceStats.accuracy }}%</span
          >
          <span class="text-xs text-gray-500 dark:text-gray-400">{{
            t("learningProgress.practice.accuracy")
          }}</span>
        </div>
      </div>

      <div class="accuracy-details">
        <div class="detail-item">
          <span class="detail-label">{{
            t("learningProgress.practice.totalPractices")
          }}</span>
          <span class="detail-value">{{ practiceStats.totalPractices }}</span>
        </div>
        <div class="detail-item correct">
          <span class="detail-label">{{
            t("learningProgress.practice.correctAnswers")
          }}</span>
          <span class="detail-value">{{ practiceStats.correctAnswers }}</span>
        </div>
        <div class="detail-item wrong">
          <span class="detail-label">{{
            t("learningProgress.practice.wrongAnswers")
          }}</span>
          <span class="detail-value">{{ practiceStats.wrongAnswers }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{
            t("learningProgress.practice.timeSpent")
          }}</span>
          <span class="detail-value">{{ formattedTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PracticeStats } from "../interface/types";

const props = defineProps<{
  practiceStats: PracticeStats;
}>();

const { t } = useI18n();

const formattedTime = computed(() => {
  const totalSeconds = props.practiceStats.totalTimeSpent;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}${t("learningProgress.practice.hours")} ${minutes}${t(
      "learningProgress.practice.minutes"
    )}`;
  }
  return `${minutes}${t("learningProgress.practice.minutes")}`;
});
</script>

<style scoped>
.practice-stats-card {
  @apply p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 mb-8;
}

.practice-type-card {
  @apply flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 transition-all duration-300;
}

.practice-type-card:hover {
  @apply transform -translate-y-1 shadow-md;
}

.practice-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center text-white mb-2;
}

.practice-count {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.practice-label {
  @apply text-xs text-gray-500 dark:text-gray-400 text-center;
}

.accuracy-section {
  @apply flex flex-col md:flex-row items-center gap-8;
}

.accuracy-chart {
  @apply relative flex items-center justify-center;
}

.accuracy-value {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.accuracy-circle {
  transition: stroke-dasharray 1s ease-out;
}

.accuracy-details {
  @apply flex-1 grid grid-cols-2 gap-4;
}

.detail-item {
  @apply p-4 rounded-xl bg-gray-100 dark:bg-white/5;
}

.detail-item.correct {
  @apply bg-emerald-50 dark:bg-emerald-500/10;
}

.detail-item.correct .detail-value {
  @apply text-emerald-600 dark:text-emerald-400;
}

.detail-item.wrong {
  @apply bg-red-50 dark:bg-red-500/10;
}

.detail-item.wrong .detail-value {
  @apply text-red-600 dark:text-red-400;
}

.detail-label {
  @apply block text-xs text-gray-500 dark:text-gray-400 mb-1;
}

.detail-value {
  @apply block text-lg font-bold text-gray-900 dark:text-white;
}
</style>
