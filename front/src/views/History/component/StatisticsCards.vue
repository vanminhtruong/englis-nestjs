<template>
  <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-500/20 dark:border-blue-500/30 rounded-xl p-4">
      <div class="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Activities</div>
      <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ statistics.totalActivities }}</div>
    </div>
    <div class="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 border border-green-500/20 dark:border-green-500/30 rounded-xl p-4">
      <div class="text-sm text-green-600 dark:text-green-400 mb-1">Vocabulary Actions</div>
      <div class="text-2xl font-bold text-green-700 dark:text-green-300">{{ statistics.vocabulary.total }}</div>
      <div class="text-xs text-green-600 dark:text-green-400 mt-1">
        +{{ statistics.vocabulary.created }} / ~{{ statistics.vocabulary.updated }} / -{{ statistics.vocabulary.deleted }}
      </div>
    </div>
    <div class="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 border border-purple-500/20 dark:border-purple-500/30 rounded-xl p-4">
      <div class="text-sm text-purple-600 dark:text-purple-400 mb-1">{{ t('history.stats.totalPractices') }}</div>
      <div class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ statistics.practice.totalPractices }}</div>
      <div class="text-xs text-purple-600 dark:text-purple-400 mt-1">
        {{ statistics.practice.accuracy.toFixed(1) }}% accuracy
      </div>
    </div>
    <div class="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/20 dark:to-orange-600/20 border border-orange-500/20 dark:border-orange-500/30 rounded-xl p-4">
      <div class="text-sm text-orange-600 dark:text-orange-400 mb-1">{{ t('history.stats.totalScore') }}</div>
      <div class="text-2xl font-bold text-orange-700 dark:text-orange-300">{{ statistics.practice.totalScore }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { HistoryStatistics } from '../interface'

defineProps<{
  statistics: HistoryStatistics | null
}>()

const { t } = useI18n()
</script>

<script lang="ts">
export default {
  name: 'StatisticsCards'
}
</script>
