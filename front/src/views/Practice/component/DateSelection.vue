<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4 mb-6">
      <button
        @click="emit('back')"
        class="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <h2 class="text-2xl font-bold text-black dark:text-white">{{ t('practice.selectDate') || 'Select Practice Date' }}</h2>
    </div>

    <div v-if="loadingDates" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      <p class="mt-4 text-black/60 dark:text-white/60">{{ t('practice.loadingDates') || 'Loading available dates...' }}</p>
    </div>

    <div v-else-if="availableDates.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        v-for="dateOption in availableDates"
        :key="dateOption.date"
        @click="emit('date-select', dateOption.date)"
        class="p-6 bg-gradient-to-br from-white to-white/50 dark:from-white/5 dark:to-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl hover:shadow-xl transition-all text-left"
        :class="{ 'ring-2 ring-primary-500': selectedDate === dateOption.date }"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-500 dark:bg-primary-600 flex items-center justify-center text-white font-bold">
            {{ new Date(dateOption.date).getDate() }}
          </div>
          <div>
            <div class="text-lg font-bold text-black dark:text-white">{{ dateOption.formattedDate }}</div>
            <div class="text-sm text-black/60 dark:text-white/60">{{ dateOption.count }} {{ t('practice.words') || 'words' }}</div>
          </div>
        </div>
      </button>
    </div>

    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">📅</div>
      <h3 class="text-2xl font-bold text-black dark:text-white mb-2">{{ t('practice.noDatesAvailable') || 'No dates available' }}</h3>
      <p class="text-black/60 dark:text-white/60">{{ t('practice.addVocabularyFirst') || 'Add some vocabulary first to practice by date' }}</p>
    </div>

    <div v-if="selectedDate" class="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
      <h3 class="text-xl font-bold text-black dark:text-white mb-4">{{ t('practice.selectModeForDate') || 'Select practice mode' }}</h3>
      
      <button
        @click="emit('start-practice-by-date', 'flashcard')"
        :disabled="loadingPracticeData"
        :class="`w-full p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg transition-all text-left ${loadingPracticeData ? 'opacity-50 cursor-not-allowed' : ''}`"
      >
        <div class="flex items-center gap-3">
          <div class="text-2xl">🎴</div>
          <div class="text-lg font-semibold">{{ t('practice.flashcard') }}</div>
          <div v-if="loadingPracticeData" class="ml-auto">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          </div>
        </div>
      </button>

      <button
        @click="emit('start-practice-by-date', 'typing')"
        :disabled="loadingPracticeData"
        :class="`w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all text-left ${loadingPracticeData ? 'opacity-50 cursor-not-allowed' : ''}`"
      >
        <div class="flex items-center gap-3">
          <div class="text-2xl">⌨️</div>
          <div class="text-lg font-semibold">{{ t('practice.typing') }}</div>
          <div v-if="loadingPracticeData" class="ml-auto">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          </div>
        </div>
      </button>

      <button
        @click="emit('start-practice-by-date', 'image_guess')"
        :disabled="loadingPracticeData"
        :class="`w-full p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all text-left ${loadingPracticeData ? 'opacity-50 cursor-not-allowed' : ''}`"
      >
        <div class="flex items-center gap-3">
          <div class="text-2xl">🖼️</div>
          <div class="text-lg font-semibold">{{ t('practice.imageGuess') }}</div>
          <div v-if="loadingPracticeData" class="ml-auto">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

type ModeKey = 'flashcard' | 'typing' | 'image_guess'

const props = defineProps<{
  availableDates: Array<{ date: string; formattedDate: string; count: number }>
  loadingDates: boolean
  selectedDate: string | null
  loadingPracticeData: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'date-select', date: string): void
  (e: 'start-practice-by-date', mode: ModeKey): void
}>()
</script>
