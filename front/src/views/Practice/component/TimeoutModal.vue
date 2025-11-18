<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="emit('close')"
    >
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="show"
          class="bg-white dark:bg-black/90 border border-black/10 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div class="text-center">
            <div class="text-6xl mb-4">⏰</div>
            <h3 class="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {{ t('practice.timeUp') || 'Time\'s Up!' }}
            </h3>
            <p class="text-lg text-black/70 dark:text-white/70 mb-6">
              {{ t('practice.timeUpMessage') || 'You ran out of time. Better luck next time!' }}
            </p>
            
            <div class="space-y-3 mb-6">
              <div class="p-4 bg-black/5 dark:bg-white/5 rounded-xl">
                <p class="text-sm text-black/60 dark:text-white/60 mb-1">
                  {{ t('practice.correctAnswer') || 'Correct Answer' }}:
                </p>
                <p class="text-xl font-bold text-primary-500 dark:text-primary-400">
                  {{ correctAnswer }}
                </p>
              </div>
            </div>

            <button
              @click="emit('restart')"
              class="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all"
            >
              {{ t('practice.backToMenu') || 'Back to Menu' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  show: boolean
  correctAnswer: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'restart'): void
}>()
</script>
