<template>
  <div class="achievements-card">
    <div class="achievements-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t("learningProgress.achievements.title") }}
      </h3>
      <div class="achievements-count">
        <span class="unlocked-count">{{ unlockedCount }}</span>
        <span class="total-count">/ {{ achievements.length }}</span>
      </div>
    </div>

    <div class="achievements-grid">
      <div
        v-for="achievement in achievements"
        :key="achievement.id"
        class="achievement-item"
        :class="{
          unlocked: achievement.isUnlocked,
          locked: !achievement.isUnlocked,
        }"
      >
        <div class="achievement-icon">
          <span class="icon-emoji">{{ achievement.icon }}</span>
          <div v-if="!achievement.isUnlocked" class="lock-overlay">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <div class="achievement-info">
          <span class="achievement-name">{{ achievement.name }}</span>
          <span class="achievement-description">{{
            achievement.description
          }}</span>
          <div class="achievement-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${achievement.progress}%` }"
              ></div>
            </div>
            <span class="progress-text">
              {{ achievement.current }} / {{ achievement.requirement }}
            </span>
          </div>
        </div>
        <div v-if="achievement.isUnlocked" class="unlock-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Achievement } from "../interface/types";

const props = defineProps<{
  achievements: Achievement[];
}>();

const { t } = useI18n();

const unlockedCount = computed(() => {
  return props.achievements.filter((a) => a.isUnlocked).length;
});
</script>

<style scoped>
.achievements-card {
  @apply p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10;
}

.achievements-header {
  @apply flex items-center justify-between mb-6;
}

.achievements-count {
  @apply flex items-baseline gap-1;
}

.unlocked-count {
  @apply text-2xl font-bold text-primary-500;
}

.total-count {
  @apply text-gray-500 dark:text-gray-400;
}

.achievements-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.achievement-item {
  @apply relative flex gap-4 p-4 rounded-xl border transition-all duration-300;
}

.achievement-item.unlocked {
  @apply bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-500/10 dark:to-secondary-500/10 border-primary-200 dark:border-primary-500/30;
}

.achievement-item.locked {
  @apply bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-60;
}

.achievement-item:hover {
  @apply transform -translate-y-1 shadow-lg;
}

.achievement-icon {
  @apply relative w-12 h-12 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center flex-shrink-0;
}

.icon-emoji {
  @apply text-2xl;
}

.lock-overlay {
  @apply absolute inset-0 rounded-xl bg-gray-900/60 flex items-center justify-center text-white;
}

.achievement-info {
  @apply flex-1 flex flex-col min-w-0;
}

.achievement-name {
  @apply font-semibold text-gray-900 dark:text-white truncate;
}

.achievement-description {
  @apply text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2;
}

.achievement-progress {
  @apply flex items-center gap-2;
}

.progress-bar {
  @apply flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden;
}

.progress-fill {
  @apply h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500;
}

.progress-text {
  @apply text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap;
}

.unlock-badge {
  @apply absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
