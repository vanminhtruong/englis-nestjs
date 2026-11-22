<template>
  <div
    class="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 text-center"
    :class="hasBackground
      ? 'border-white/25 bg-black/40 text-white/70 backdrop-blur-sm'
      : 'border-gray-200 bg-gray-100/80 text-gray-500 dark:border-white/15 dark:bg-white/5 dark:text-gray-400'"
  >
    <span
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
      :class="hasBackground ? 'bg-white/10 text-white/80' : 'bg-white text-gray-400 dark:bg-white/10 dark:text-gray-400'"
      aria-hidden="true"
    >
      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m3.5 17 5.5-5.5 4 4 3-3 4.5 4.5" />
      </svg>
    </span>
    <span class="text-xs font-medium leading-5">{{ t('vocabulary.noImage') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ hasBackground?: boolean }>()
const { t } = useI18n()
</script>
