<template>
  <header class="mb-6 min-w-0 sm:mb-8">
    <RouterLink to="/categories" class="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-black/70 transition-colors hover:border-primary-300 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-primary-400">
      <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7"/></svg>
      {{ t('categories.title') }}
    </RouterLink>
    <div data-category-detail-hero :style="style" class="detail-hero relative min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-black sm:rounded-3xl">
      <div class="detail-hero__accent h-1 w-full" aria-hidden="true" />
      <div class="relative flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div class="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-5">
          <CategoryIcon :icon="category.icon" :color="category.color" size="hero" data-category-detail-icon />
          <div class="min-w-0 flex-1">
            <div class="mb-1.5 flex flex-wrap items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">{{ t('categories.name') }}</span>
              <span v-if="category.isPinned" class="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
                <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 17v5M5 17h14v-2l-4-3V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v6l-4 3z"/></svg>{{ t('categories.pin_pinned') }}
              </span>
            </div>
            <h1 class="break-words text-2xl font-bold leading-tight tracking-tight text-black dark:text-white sm:text-4xl">{{ category.name }}</h1>
            <p v-if="category.description" class="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-black/60 dark:text-white/60 sm:text-base">{{ category.description }}</p>
          </div>
        </div>
        <div data-category-detail-count class="flex min-w-0 shrink-0 items-center gap-3 rounded-xl border border-black/10 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-black/60 sm:min-w-36 sm:flex-col sm:items-start sm:gap-2 sm:rounded-2xl sm:p-4">
          <span class="detail-count-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-black/70 dark:text-white/80">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </span>
          <div class="min-w-0">
            <span class="block text-2xl font-bold leading-none tabular-nums text-black dark:text-white sm:text-3xl">{{ vocabularyCount }}</span>
            <span class="mt-1 block break-words text-xs font-medium text-black/60 dark:text-white/60 sm:text-sm">{{ t('categories.vocabularyCount') }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CategoryIcon from './CategoryIcon.vue'
import { useCategoryAppearance } from '../composable/useCategoryAppearance'
import type { Category } from '../interface/category.interface'
const props = defineProps<{ category: Category; vocabularyCount: number }>()
const { t } = useI18n()
const { style } = useCategoryAppearance(() => props.category.color)
</script>

<style scoped>
.detail-hero {
  background-image: linear-gradient(125deg, color-mix(in srgb, var(--category-accent) 13%, transparent), transparent 85%);
}
.detail-hero__accent {
  background: linear-gradient(90deg, var(--category-accent), color-mix(in srgb, var(--category-accent) 35%, transparent));
}
.detail-count-icon {
  background: color-mix(in srgb, var(--category-accent) 14%, transparent);
}
</style>
