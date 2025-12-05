<template>
  <div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <!-- Total Words -->
      <div class="stats-card group">
        <div class="stats-icon bg-gradient-to-br from-blue-500 to-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
            />
          </svg>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ animatedTotals.totalWords }}</span>
          <span class="stats-label">{{
            t("learningProgress.overview.totalWords")
          }}</span>
        </div>
        <div class="stats-glow bg-blue-500/20"></div>
      </div>

      <!-- Mastered Words -->
      <div class="stats-card group">
        <div
          class="stats-icon bg-gradient-to-br from-emerald-500 to-emerald-600"
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ animatedTotals.masteredWords }}</span>
          <span class="stats-label">{{
            t("learningProgress.overview.masteredWords")
          }}</span>
        </div>
        <div class="stats-glow bg-emerald-500/20"></div>
      </div>

      <!-- Learning Words -->
      <div class="stats-card group">
        <div class="stats-icon bg-gradient-to-br from-amber-500 to-amber-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ animatedTotals.learningWords }}</span>
          <span class="stats-label">{{
            t("learningProgress.overview.learningWords")
          }}</span>
        </div>
        <div class="stats-glow bg-amber-500/20"></div>
      </div>

      <!-- New Words -->
      <div class="stats-card group">
        <div class="stats-icon bg-gradient-to-br from-purple-500 to-purple-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ animatedTotals.newWords }}</span>
          <span class="stats-label">{{
            t("learningProgress.overview.newWords")
          }}</span>
        </div>
        <div class="stats-glow bg-purple-500/20"></div>
      </div>
    </div>

    <!-- Mastery Progress Bar -->
    <div class="mastery-card mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t("learningProgress.overview.mastery") }}
        </h3>
        <span
          class="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
        >
          {{ masteryPercentage }}%
        </span>
      </div>
      <div class="mastery-progress-bar">
        <div
          class="mastery-progress-fill"
          :style="{ width: `${masteryPercentage}%` }"
        ></div>
      </div>
      <div
        class="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  masteryPercentage: number;
}>();

const { t } = useI18n();

const animatedTotals = ref({
  totalWords: 0,
  masteredWords: 0,
  learningWords: 0,
  newWords: 0,
});

const animateNumber = (
  target: number,
  key: keyof typeof animatedTotals.value
) => {
  const duration = 1000;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      animatedTotals.value[key] = target;
      clearInterval(interval);
    } else {
      animatedTotals.value[key] = Math.floor(current);
    }
  }, duration / steps);
};

onMounted(() => {
  animateNumber(props.totalWords, "totalWords");
  animateNumber(props.masteredWords, "masteredWords");
  animateNumber(props.learningWords, "learningWords");
  animateNumber(props.newWords, "newWords");
});

watch(
  () => props,
  (newProps) => {
    animateNumber(newProps.totalWords, "totalWords");
    animateNumber(newProps.masteredWords, "masteredWords");
    animateNumber(newProps.learningWords, "learningWords");
    animateNumber(newProps.newWords, "newWords");
  },
  { deep: true }
);
</script>

<style scoped>
.stats-card {
  @apply relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-all duration-300;
}

.stats-card:hover {
  @apply transform -translate-y-1 shadow-lg;
}

.stats-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 transition-transform duration-300;
}

.stats-card:hover .stats-icon {
  @apply transform scale-110;
}

.stats-content {
  @apply flex flex-col;
}

.stats-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.stats-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.stats-glow {
  @apply absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-0 transition-opacity duration-300;
}

.stats-card:hover .stats-glow {
  @apply opacity-100;
}

.mastery-card {
  @apply p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10;
}

.mastery-progress-bar {
  @apply h-4 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden;
}

.mastery-progress-fill {
  @apply h-full rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 transition-all duration-1000 ease-out;
  background-size: 200% 200%;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
