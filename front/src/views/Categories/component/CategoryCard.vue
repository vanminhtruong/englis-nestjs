<template>
  <article v-scroll-reveal.paint data-seasonal-card class="category-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-black motion-reduce:transform-none motion-reduce:transition-none"
    :class="selected ? 'border-primary-500 ring-2 ring-primary-500/20 dark:border-primary-400' : 'border-black/10 hover:border-primary-300/70 dark:border-white/10 dark:hover:border-primary-500/50'"
    :style="style">
    <div class="category-card__hero relative flex min-w-0 items-start justify-between gap-2 border-b border-black/5 px-4 pb-4 pt-4 dark:border-white/10 sm:px-4">
      <CategoryIcon :icon="category.icon" :color="category.color" data-category-card-icon />
      <div class="flex min-w-0 flex-col items-end gap-2">
        <button v-if="selectionMode" type="button" data-category-select :disabled="selectionBusy" :aria-pressed="selected"
          :aria-label="t(selected ? 'categories.deselectCategory' : 'categories.selectCategory') + ': ' + category.name"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-white/10 disabled:opacity-50"
          @click="$emit('toggle-selection', category.id)">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors" :class="selected ? 'border-transparent bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm' : 'border-black/20 bg-white dark:border-white/25 dark:bg-black'">
            <svg v-if="selected" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>
          </span>
        </button>
        <div v-else data-category-card-actions class="flex shrink-0 items-center gap-0.5 rounded-xl border border-black/5 bg-white/90 p-0.5 shadow-sm dark:border-white/10 dark:bg-black/80">
          <button type="button" :disabled="selectionBusy" :aria-pressed="!!category.isPinned" :title="t(category.isPinned ? 'categories.unpin' : 'categories.pin')" :aria-label="t(category.isPinned ? 'categories.unpin' : 'categories.pin')"
            class="category-card__action" :class="category.isPinned ? '!bg-yellow-100 !text-yellow-700 dark:!bg-yellow-500/10 dark:!text-yellow-400' : 'hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-500/10 dark:hover:text-yellow-400'"
            @click="$emit('toggle-pin', category.id)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
          </button>
          <button type="button" :disabled="selectionBusy" :title="t('categories.edit')" :aria-label="t('categories.edit')" class="category-card__action hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400" @click="$emit('open-edit-modal', category)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button type="button" :disabled="selectionBusy" :title="t('categories.delete')" :aria-label="t('categories.delete')" class="category-card__action hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400" @click="$emit('delete', category.id)">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
        <span v-if="category.isPinned" class="inline-flex max-w-full items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-[11px] font-semibold leading-tight text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
          <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/><path d="M11 17h2v5h-2z"/></svg>
          <span class="truncate">{{ t('categories.pin_pinned') }}</span>
        </span>
      </div>
    </div>
    <div class="flex min-w-0 flex-1 flex-col px-4 pb-3 pt-3.5">
      <h3 :title="category.name" class="line-clamp-2 break-words text-lg font-bold leading-snug tracking-tight text-gray-900 dark:text-white">{{ category.name }}</h3>
      <p v-if="category.description" :title="category.description" class="mt-1.5 line-clamp-2 break-words text-sm leading-relaxed text-gray-600 dark:text-white/60">{{ category.description }}</p>
      <div class="flex-1 min-h-3" />
      <div v-if="smartMode !== 'all' && category.smart && (category.smart.needsReview || category.smart.isInterested)" data-category-smart-reason class="flex min-w-0 items-center gap-2 rounded-lg bg-primary-50 px-2.5 py-2 text-xs leading-4 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
        <svg v-if="category.smart.needsReview" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
        <svg v-else class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>
        <span class="min-w-0 break-words">{{ category.smart.needsReview ? t(category.smart.hasStudied ? 'categories.smartIdle' : 'categories.smartNeverStudied', { days: category.smart.idleDays }) : t('categories.smartRecentActivity', { count: category.smart.recentActivityCount }) }}</span>
      </div>
    </div>
    <div class="px-3.5 pb-3.5">
      <RouterLink :to="`/categories/${category.id}`" :aria-label="t('categories.viewVocabularies') + ': ' + category.name" :title="t('categories.viewVocabularies')"
        class="group/link flex min-w-0 items-center gap-2.5 rounded-xl border border-black/5 bg-black/[0.025] px-3 py-2.5 transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary-500/40 dark:hover:bg-primary-900/20">
        <span class="category-card__count-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/5 dark:border-white/10">
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-lg font-bold leading-none tabular-nums text-black dark:text-white">{{ category.vocabularyCount ?? category.vocabularies?.length ?? 0 }}</span>
          <span class="mt-1 block break-words text-xs leading-tight text-black/60 dark:text-white/60">{{ t('categories.vocabularyCount') }}</span>
        </span>
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/50 transition-colors group-hover/link:bg-primary-500 group-hover/link:text-white dark:text-white/60">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
        </span>
      </RouterLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CategoryIcon from './CategoryIcon.vue'
import { useCategoryAppearance } from '../composable/useCategoryAppearance'
import type { Category, CategorySmartMode } from '../interface/category.interface'

const props = defineProps<{ category: Category; selected: boolean; selectionMode: boolean; selectionBusy: boolean; smartMode: CategorySmartMode }>()
defineEmits<{ 'toggle-pin': [id: string]; 'open-edit-modal': [category: Category]; 'toggle-selection': [id: string]; delete: [id: string] }>()
const { t } = useI18n()
const { style } = useCategoryAppearance(() => props.category.color)
</script>

<style scoped lang="postcss">
.category-card__hero {
  background: linear-gradient(125deg, color-mix(in srgb, var(--category-accent) 13%, transparent), transparent 85%);
}
.category-card__action {
  @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:opacity-40 dark:text-white/60;
}
.category-card__count-icon {
  background: color-mix(in srgb, var(--category-accent) 14%, transparent);
  @apply text-black/70 dark:text-white/80;
}
</style>
