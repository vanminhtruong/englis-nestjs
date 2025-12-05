<template>
  <div class="weekly-card">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
      {{ t("learningProgress.weekly.title") }}
    </h3>

    <div class="weekly-chart">
      <div
        v-for="(day, index) in weeklyProgress"
        :key="day.date"
        class="day-column"
        :style="{ '--delay': `${index * 100}ms` }"
      >
        <div class="bar-container">
          <div
            class="bar"
            :style="{ height: `${getBarHeight(day.practiceCount)}%` }"
            :class="{ active: day.practiceCount > 0 }"
          >
            <div class="bar-tooltip">
              <div class="tooltip-item">
                <span class="tooltip-value">{{ day.practiceCount }}</span>
                <span class="tooltip-label">{{
                  t("learningProgress.weekly.practices")
                }}</span>
              </div>
              <div class="tooltip-item">
                <span class="tooltip-value">{{ day.wordsLearned }}</span>
                <span class="tooltip-label">{{
                  t("learningProgress.weekly.wordsLearned")
                }}</span>
              </div>
              <div class="tooltip-item">
                <span class="tooltip-value">{{ day.score }}</span>
                <span class="tooltip-label">{{
                  t("learningProgress.weekly.points")
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <span class="day-label" :class="{ today: isToday(day.date) }">
          {{ day.dayName }}
        </span>
      </div>
    </div>

    <div class="weekly-legend">
      <div class="legend-item">
        <div class="legend-dot active"></div>
        <span>{{ t("learningProgress.streak.activeToday") }}</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot"></div>
        <span>{{ t("learningProgress.streak.notActiveToday") }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { WeeklyProgress } from "../interface/types";

const props = defineProps<{
  weeklyProgress: WeeklyProgress[];
}>();

const { t } = useI18n();

const maxPracticeCount = computed(() => {
  return Math.max(...props.weeklyProgress.map((d) => d.practiceCount), 1);
});

const getBarHeight = (count: number) => {
  return Math.max(10, (count / maxPracticeCount.value) * 100);
};

const isToday = (date: string) => {
  return new Date().toISOString().split("T")[0] === date;
};
</script>

<style scoped>
.weekly-card {
  @apply p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 mb-8;
}

.weekly-chart {
  @apply flex items-end justify-between gap-2 h-48 px-4;
}

.day-column {
  @apply flex-1 flex flex-col items-center gap-2;
  animation: fadeInUp 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

.bar-container {
  @apply relative flex-1 w-full flex items-end justify-center;
}

.bar {
  @apply relative w-full max-w-[40px] rounded-t-lg bg-gray-200 dark:bg-white/10 transition-all duration-500 ease-out cursor-pointer;
}

.bar.active {
  @apply bg-gradient-to-t from-primary-500 to-secondary-500;
}

.bar:hover {
  @apply opacity-80;
}

.bar-tooltip {
  @apply absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs opacity-0 invisible transition-all duration-200 whitespace-nowrap z-10;
  min-width: 120px;
}

.bar:hover .bar-tooltip {
  @apply opacity-100 visible;
}

.tooltip-item {
  @apply flex justify-between gap-4 py-1;
}

.tooltip-value {
  @apply font-bold;
}

.tooltip-label {
  @apply opacity-70;
}

.day-label {
  @apply text-sm text-gray-500 dark:text-gray-400 font-medium;
}

.day-label.today {
  @apply text-primary-500 font-bold;
}

.weekly-legend {
  @apply flex items-center justify-center gap-6 mt-6;
}

.legend-item {
  @apply flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400;
}

.legend-dot {
  @apply w-3 h-3 rounded-full bg-gray-200 dark:bg-white/10;
}

.legend-dot.active {
  @apply bg-gradient-to-r from-primary-500 to-secondary-500;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
