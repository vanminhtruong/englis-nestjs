<template>
  <button
    @click="$emit('toggle')"
    class="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
  >
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-primary-500 dark:bg-primary-600 flex items-center justify-center text-white font-bold">
        {{ dayNumber }}
      </div>
      <div class="text-left">
        <h3 class="text-lg font-semibold text-black dark:text-white">
          {{ formattedDate }}
        </h3>
        <p class="text-sm text-black/50 dark:text-white/60">
          {{ count }} {{ wordsCountText }}
        </p>
      </div>
    </div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 text-black/40 dark:text-white/50 transition-transform"
      :class="{ 'rotate-180': isExpanded }"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  dayNumber: number
  formattedDate: string
  count: number
  wordsCountText: string
  isExpanded: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>
