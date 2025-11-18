<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-black dark:text-white mb-4">{{ t('practice.modes') }}</h2>

    <div v-if="loadingModes" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
      <p class="mt-2 text-black/60 dark:text-white/60">Loading practice modes...</p>
    </div>

    <div v-else-if="practiceModes.length > 0" class="space-y-4">
      <button
        v-for="mode in practiceModes"
        :key="mode.id"
        @click="emit('mode-click', mode)"
        :disabled="loadingPracticeData"
        :class="`w-full p-6 ${getModeGradient(mode)} bg-gradient-to-r text-white rounded-2xl hover:shadow-xl transition-all text-left ${loadingPracticeData ? 'opacity-50 cursor-not-allowed' : ''}`"
      >
        <div class="flex items-center gap-4">
          <div class="text-4xl">{{ mode.icon }}</div>
          <div>
            <div class="text-xl font-bold">{{ mode.name }}</div>
            <div class="text-sm opacity-90">{{ mode.description }}</div>
          </div>
          <div v-if="loadingPracticeData" class="ml-auto">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
        </div>
      </button>
    </div>

    <div v-else-if="modesLoaded && practiceModes.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-2xl font-bold text-black dark:text-white mb-2">No Practice Modes Available</h3>
      <p class="text-black/60 dark:text-white/60 mb-4">Please contact administrator to set up practice modes.</p>
      <button
        @click="emit('retry-loading')"
        class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        Retry Loading
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface PracticeModeItem {
  id: string
  key: string
  name: string
  description: string
  icon: string
  color: string
}

const props = defineProps<{
  practiceModes: PracticeModeItem[]
  loadingModes: boolean
  modesLoaded: boolean
  loadingPracticeData: boolean
}>()

const emit = defineEmits<{
  (e: 'mode-click', mode: PracticeModeItem): void
  (e: 'retry-loading'): void
}>()

const MODE_GRADIENTS: Record<string, string> = {
  flashcard: 'from-primary-500 to-secondary-500',
  typing: 'from-purple-500 to-pink-500',
  image_guess: 'from-pink-500 to-rose-500',
  practice_by_date: 'from-orange-500 to-red-500',
  multiple_choice: 'from-blue-500 to-cyan-500',
  listening: 'from-green-500 to-emerald-500',
}

function getModeGradient(mode: PracticeModeItem): string {
  return MODE_GRADIENTS[mode.key] || mode.color || 'from-orange-500 to-red-500'
}
</script>
