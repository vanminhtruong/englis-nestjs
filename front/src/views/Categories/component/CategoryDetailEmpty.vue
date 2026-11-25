<template>
  <div data-category-detail-empty class="flex min-w-0 flex-col items-center rounded-2xl border border-dashed border-black/15 bg-black/[0.02] px-5 py-12 text-center dark:border-white/15 dark:bg-white/[0.02] sm:py-16">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
      <component :is="bookIcon" class="h-9 w-9" />
    </div>
    <h2 class="text-lg font-bold text-black dark:text-white sm:text-xl">{{ t('categories.detailEmptyTitle') }}</h2>
    <p class="mt-2 max-w-sm text-sm leading-relaxed text-black/60 dark:text-white/60">{{ t('categories.detailEmptyHint') }}</p>
    <RouterLink to="/vocabulary" class="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2.5 text-sm font-semibold text-white transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary-500/40">
      {{ t('categories.detailGoVocabulary') }}
      <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getIconComponent } from '../../../utils/iconRenderer'
const { t } = useI18n()
const bookIcon = getIconComponent('book')
</script>
