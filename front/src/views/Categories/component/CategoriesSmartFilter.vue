<template>
  <div class="col-span-full min-w-0 rounded-xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
    <div class="mb-2.5 flex items-center gap-2">
      <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3zM19 3v4m-2-2h4"/></svg>
      </span>
      <h3 class="min-w-0 flex-1 text-sm font-semibold text-black dark:text-white">{{ t('categories.smartFilter') }}</h3>
      <span v-if="summary.neglected" data-category-smart-reminder class="shrink-0 text-xs font-medium text-black/50 dark:text-white/50">{{ t('categories.smartReminder', { count: summary.neglected }) }}</span>
    </div>
    <div role="group" :aria-label="t('categories.smartFilter')" class="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
      <button v-for="option in options" :key="option.value" type="button" :data-category-smart="option.value"
        :aria-pressed="modelValue === option.value" class="flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary-500/30"
        :class="modelValue === option.value ? 'border-primary-500/40 bg-primary-50 text-primary-700 dark:border-primary-400/40 dark:bg-primary-900/30 dark:text-primary-300' : 'border-black/10 bg-white text-black/65 hover:border-primary-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:border-primary-400/30'"
        @click="$emit('update:modelValue', option.value)">
        <span class="min-w-0 break-words text-center">{{ t('categories.smart_' + option.value) }}</span>
        <span v-if="option.count !== null" class="shrink-0 rounded-md bg-black/5 px-1.5 py-0.5 text-[11px] tabular-nums dark:bg-white/10">{{ option.count }}</span>
      </button>
    </div>
    <p class="mt-2 text-xs leading-5 text-black/50 dark:text-white/50">{{ t('categories.smartHint_' + modelValue) }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CategorySmartMode, CategorySmartSummary } from '../interface/category.interface'
const props = defineProps<{ modelValue: CategorySmartMode; summary: CategorySmartSummary }>()
defineEmits<{ 'update:modelValue': [value: CategorySmartMode] }>()
const { t } = useI18n()
const options = computed((): { value: CategorySmartMode; count: number | null }[] => [
  { value: 'all', count: null },
  { value: 'recommended', count: props.summary.recommended },
  { value: 'interested', count: props.summary.interested },
  { value: 'neglected', count: props.summary.neglected },
])
</script>
