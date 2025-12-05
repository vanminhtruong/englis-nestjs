<template>
  <div class="streak-card">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ t("learningProgress.streak.title") }}
    </h3>

    <div class="streak-content">
      <!-- Current Streak -->
      <div class="streak-display">
        <div class="streak-fire" :class="{ active: streak.currentStreak > 0 }">
          <span class="fire-emoji">🔥</span>
          <div class="fire-glow"></div>
        </div>
        <div class="streak-info">
          <span class="streak-number">{{ streak.currentStreak }}</span>
          <span class="streak-label">{{
            t("learningProgress.streak.days")
          }}</span>
        </div>
        <span class="streak-title">{{
          t("learningProgress.streak.currentStreak")
        }}</span>
      </div>

      <!-- Longest Streak -->
      <div class="streak-display secondary">
        <div class="streak-trophy">
          <span class="trophy-emoji">🏆</span>
        </div>
        <div class="streak-info">
          <span class="streak-number">{{ streak.longestStreak }}</span>
          <span class="streak-label">{{
            t("learningProgress.streak.days")
          }}</span>
        </div>
        <span class="streak-title">{{
          t("learningProgress.streak.longestStreak")
        }}</span>
      </div>
    </div>

    <!-- Today Status -->
    <div class="today-status" :class="{ active: streak.isActiveToday }">
      <span v-if="streak.isActiveToday" class="status-icon">✅</span>
      <span v-else class="status-icon">⏳</span>
      <span class="status-text">
        {{
          streak.isActiveToday
            ? t("learningProgress.streak.activeToday")
            : t("learningProgress.streak.notActiveToday")
        }}
      </span>
    </div>

    <p
      v-if="!streak.isActiveToday && streak.currentStreak > 0"
      class="streak-warning"
    >
      {{ t("learningProgress.streak.keepGoing") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { StreakInfo } from "../interface/types";

const props = defineProps<{
  streak: StreakInfo;
}>();

const { t } = useI18n();
</script>

<style scoped>
.streak-card {
  @apply p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 mb-8;
}

.streak-content {
  @apply grid grid-cols-2 gap-6 mb-6;
}

.streak-display {
  @apply flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10;
}

.streak-display.secondary {
  @apply from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10;
}

.streak-fire {
  @apply relative w-16 h-16 flex items-center justify-center mb-2;
}

.streak-fire.active .fire-emoji {
  animation: fireAnimation 0.5s ease-in-out infinite alternate;
}

.fire-emoji,
.trophy-emoji {
  @apply text-4xl;
}

.streak-trophy {
  @apply w-16 h-16 flex items-center justify-center mb-2;
}

.fire-glow {
  @apply absolute inset-0 bg-orange-500/30 rounded-full blur-xl scale-150 opacity-0 transition-opacity;
}

.streak-fire.active .fire-glow {
  @apply opacity-100;
  animation: glowPulse 1s ease-in-out infinite;
}

.streak-info {
  @apply flex items-baseline gap-1;
}

.streak-number {
  @apply text-4xl font-bold text-gray-900 dark:text-white;
}

.streak-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.streak-title {
  @apply text-sm text-gray-600 dark:text-gray-300 mt-1;
}

.today-status {
  @apply flex items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/5 transition-all;
}

.today-status.active {
  @apply bg-emerald-100 dark:bg-emerald-500/20;
}

.status-icon {
  @apply text-xl;
}

.status-text {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.today-status.active .status-text {
  @apply text-emerald-700 dark:text-emerald-300;
}

.streak-warning {
  @apply mt-4 text-sm text-center text-amber-600 dark:text-amber-400;
}

@keyframes fireAnimation {
  from {
    transform: scale(1) rotate(-3deg);
  }
  to {
    transform: scale(1.1) rotate(3deg);
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}
</style>
