<template>
  <div class="rank-card">
    <div class="rank-header">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ t('learningProgress.rank.title') }}
      </h3>
      <div class="rank-scores">
        <div class="score-item">
          <span class="score-value">{{ totalScore.toLocaleString() }}</span>
          <span class="score-label">{{ t('learningProgress.rank.totalScore') }}</span>
        </div>
        <div class="score-divider"></div>
        <div class="score-item">
          <span class="score-value">{{ averageScore }}</span>
          <span class="score-label">{{ t('learningProgress.rank.averageScore') }}</span>
        </div>
      </div>
    </div>

    <div class="rank-display">
      <div class="rank-badge" :class="[`rank-${rank}`]">
        <span class="rank-icon">{{ rankInfo.icon }}</span>
        <div class="rank-glow"></div>
      </div>
      <div class="rank-info">
        <span class="rank-name">{{ t(`learningProgress.rank.ranks.${rank}`) }}</span>
        <span class="rank-level">{{ t('learningProgress.rank.progress') }}: {{ rankProgress }}%</span>
      </div>
    </div>

    <div class="rank-progress">
      <div class="rank-progress-bar">
        <div 
          class="rank-progress-fill"
          :class="[`bg-gradient-to-r ${rankInfo.gradient}`]"
          :style="{ width: `${rankProgress}%` }"
        ></div>
        <div 
          class="rank-progress-glow"
          :style="{ left: `${rankProgress}%`, background: rankInfo.color }"
        ></div>
      </div>
      <div class="rank-progress-labels">
        <span>{{ currentRankThreshold.toLocaleString() }}</span>
        <span v-if="nextRank">{{ nextRankThreshold.toLocaleString() }}</span>
        <span v-else>MAX</span>
      </div>
    </div>

    <div v-if="nextRank" class="next-rank-info">
      <span class="next-rank-icon">{{ nextRankInfo?.icon }}</span>
      <span class="next-rank-text">
        {{ t('learningProgress.rank.nextRank') }}: 
        <strong>{{ t(`learningProgress.rank.ranks.${nextRank}`) }}</strong>
        <span class="points-needed">({{ pointsToNextRank.toLocaleString() }} {{ t('learningProgress.rank.pointsNeeded') }})</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LearningRank } from '../interface/types'
import { RANK_INFO, RANK_THRESHOLDS } from '../interface/types'

const props = defineProps<{
  rank: LearningRank
  rankProgress: number
  totalScore: number
  averageScore: number
}>()

const { t } = useI18n()

const rankInfo = computed(() => RANK_INFO[props.rank])

const currentRankThreshold = computed(() => RANK_THRESHOLDS[props.rank])

const rankOrder: LearningRank[] = [
  'beginner', 'elementary', 'intermediate', 
  'upper_intermediate', 'advanced', 'proficient', 'master'
]

const nextRank = computed(() => {
  const currentIndex = rankOrder.indexOf(props.rank)
  return currentIndex < rankOrder.length - 1 ? rankOrder[currentIndex + 1] : null
})

const nextRankThreshold = computed(() => {
  return nextRank.value ? RANK_THRESHOLDS[nextRank.value] : RANK_THRESHOLDS[props.rank]
})

const nextRankInfo = computed(() => {
  return nextRank.value ? RANK_INFO[nextRank.value] : null
})

const pointsToNextRank = computed(() => {
  return Math.max(0, nextRankThreshold.value - props.totalScore)
})
</script>

<style scoped>
.rank-card {
  @apply p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 mb-8;
}

.rank-header {
  @apply flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4;
}

.rank-scores {
  @apply flex items-center gap-4;
}

.score-item {
  @apply flex flex-col items-center;
}

.score-value {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.score-label {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.score-divider {
  @apply w-px h-10 bg-gray-200 dark:bg-white/10;
}

.rank-display {
  @apply flex items-center gap-4 mb-6;
}

.rank-badge {
  @apply relative w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden;
}

.rank-beginner { @apply bg-gradient-to-br from-green-400 to-green-600; }
.rank-elementary { @apply bg-gradient-to-br from-cyan-400 to-cyan-600; }
.rank-intermediate { @apply bg-gradient-to-br from-blue-400 to-blue-600; }
.rank-upper_intermediate { @apply bg-gradient-to-br from-violet-400 to-violet-600; }
.rank-advanced { @apply bg-gradient-to-br from-amber-400 to-orange-600; }
.rank-proficient { @apply bg-gradient-to-br from-pink-400 to-rose-600; }
.rank-master { @apply bg-gradient-to-br from-yellow-400 to-amber-600; }

.rank-icon {
  @apply text-4xl z-10;
}

.rank-glow {
  @apply absolute inset-0 bg-white/20 animate-pulse;
}

.rank-info {
  @apply flex flex-col;
}

.rank-name {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.rank-level {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.rank-progress {
  @apply mb-4;
}

.rank-progress-bar {
  @apply relative h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden;
}

.rank-progress-fill {
  @apply h-full rounded-full transition-all duration-1000 ease-out;
}

.rank-progress-glow {
  @apply absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full blur-md opacity-75 transition-all duration-1000;
}

.rank-progress-labels {
  @apply flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400;
}

.next-rank-info {
  @apply flex items-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-sm text-gray-600 dark:text-gray-300;
}

.next-rank-icon {
  @apply text-xl;
}

.next-rank-text strong {
  @apply text-gray-900 dark:text-white;
}

.points-needed {
  @apply text-gray-500 dark:text-gray-400 ml-1;
}
</style>
