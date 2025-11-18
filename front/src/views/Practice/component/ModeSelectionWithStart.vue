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
      <h2 class="text-2xl font-bold text-black dark:text-white">{{ t('practice.readyToStart') || 'Ready to Start' }}</h2>
    </div>

    <div class="text-center">
      <h3 class="text-3xl font-bold text-black dark:text-white mb-8">
        {{ session.mode === 'flashcard' ? t('practice.flashcard') : t('practice.typing') }}
      </h3>
      <p class="text-lg text-black/60 dark:text-white/60 mb-8">
        {{ session.mode === 'flashcard' ? t('practice.whatIsMeaning') : t('practice.typeTheWord') }}
      </p>
      <button
        @click="emit('start-session')"
        class="px-12 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xl rounded-2xl hover:shadow-xl transition-all"
      >
        {{ t('practice.startPractice') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ session: { mode: 'flashcard' | 'typing' } }>()
const emit = defineEmits<{ (e: 'back'): void; (e: 'start-session'): void }>()
</script>
