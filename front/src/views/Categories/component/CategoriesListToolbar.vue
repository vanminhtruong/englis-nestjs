<template>
  <div class="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
    <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1" aria-live="polite">
      <p data-category-result class="text-xs font-semibold text-black/70 dark:text-white/70 sm:text-sm">{{ resultLabel }}</p>
      <span class="rounded-md bg-black/5 px-2 py-1 text-[11px] font-medium tabular-nums text-black/50 dark:bg-white/5 dark:text-white/50 sm:text-xs">{{ pageLabel }}</span>
    </div>
    <div class="flex shrink-0 items-center gap-1.5">
      <button v-if="selectionMode && !selectedCount" type="button" data-category-quick-select :disabled="busy || !canSelectPage"
        class="inline-flex min-h-10 items-center justify-center rounded-lg px-2.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50 disabled:opacity-40 dark:text-primary-400 dark:hover:bg-white/10"
        @click="$emit('select-page')">{{ t('categories.selectPage') }}</button>
      <button type="button" data-category-selection-mode :aria-pressed="selectionMode" :disabled="busy || (!selectionMode && !canSelectPage)"
        class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
        :class="selectionMode ? 'border-primary-500/30 bg-primary-50 text-primary-700 dark:border-primary-400/30 dark:bg-primary-900/30 dark:text-primary-300' : 'border-black/10 bg-white text-black/65 hover:border-primary-500/40 hover:text-primary-600 dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:text-primary-400'"
        @click="$emit('toggle-mode')">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="selectionMode" d="m5 12 4 4L19 6"/>
          <template v-else><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7.5 12 3 3 6-6"/></template>
        </svg>
        {{ t(selectionMode ? 'categories.finishSelection' : 'categories.multiSelect') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineProps<{ resultLabel: string; pageLabel: string; selectionMode: boolean; selectedCount: number; busy: boolean; canSelectPage: boolean }>()
defineEmits<{ 'toggle-mode': []; 'select-page': [] }>()
</script>
