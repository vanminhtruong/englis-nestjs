<template>
  <CollapsibleFormSection v-model="searchExpanded" data-category-search-panel compact icon="search"
    :title="t('categories.searchAndFilter')" :summary="chips.length ? t('categories.filterCount', { count: chips.length }) : smartSummary.neglected ? t('categories.smartReminder', { count: smartSummary.neglected }) : undefined"
    class="mb-4">
    <div class="space-y-3">
    <div v-if="hasFilters" class="flex justify-end">
      <button type="button" data-category-reset class="rounded-lg px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-white/10" @click="$emit('reset')">{{ t('categories.resetFilters') }}</button>
    </div>
    <div class="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)] lg:items-end">
      <div class="min-w-0">
        <label :for="searchId" class="mb-2 block text-sm font-medium text-black/70 dark:text-white/70">{{ t('categories.searchLabel') }}</label>
        <div class="relative flex min-h-12 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 transition focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/15 dark:border-white/10 dark:bg-black">
          <svg class="h-5 w-5 shrink-0 text-black/40 dark:text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
          <input :id="searchId" :value="filters.search" type="search" maxlength="200" :placeholder="t('categories.searchPlaceholder')" class="min-w-0 flex-1 bg-transparent py-3 text-sm text-black outline-none placeholder:text-black/40 dark:text-white dark:placeholder:text-white/40" @input="change('search', ($event.target as HTMLInputElement).value)" />
          <button v-if="filters.search" type="button" :aria-label="t('categories.clearSearch')" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10" @click="change('search', '')">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
        </div>
      </div>
      <ModalSelect :model-value="filters.sort" :options="sortOptions" :label="t('categories.sortLabel')" @update:model-value="change('sort', $event)" />
    </div>
    <div class="flex flex-wrap gap-2" role="group" :aria-label="t('categories.pinFilter')">
      <button v-for="option in pinOptions" :key="option.value" type="button" :aria-pressed="filters.pinned === option.value"
        class="inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
        :class="filters.pinned === option.value ? 'border-primary-500/40 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'border-black/10 text-black/60 hover:bg-black/5 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/10'"
        @click="change('pinned', option.value)">
        <svg v-if="option.value === 'pinned'" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3 21 8l-5 1-4 4-1 4-4-4-4-4 4-1 4-4 1-5M7 13l-5 5"/></svg>
        {{ option.label }}
      </button>
    </div>
    <div class="rounded-xl border border-black/10 dark:border-white/10">
      <button type="button" data-category-advanced :aria-expanded="expanded" :aria-controls="panelId" class="flex min-h-12 w-full min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-black/5 dark:hover:bg-white/5" @click="expanded = !expanded">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="17" r="2" fill="currentColor"/></svg>
        </span>
        <span class="min-w-0 flex-1 break-words text-sm font-semibold text-black dark:text-white">{{ t('categories.advancedFilters') }}</span>
        <span v-if="advancedCount" class="rounded-full bg-primary-500/10 px-2 py-1 text-xs font-bold text-primary-600 dark:text-primary-400">{{ advancedCount }}</span>
        <svg class="h-4 w-4 shrink-0 text-black/50 transition-transform dark:text-white/50" :class="expanded ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div :id="panelId" :hidden="!expanded">
        <div v-if="expanded" class="grid min-w-0 gap-3 border-t border-black/10 p-3 dark:border-white/10 sm:grid-cols-2 xl:grid-cols-4">
          <CategoriesSmartFilter :model-value="filters.smart" :summary="smartSummary" @update:model-value="change('smart', $event)" />
          <ModalSelect :model-value="filters.scope" :options="scopeOptions" :label="t('categories.searchScope')" @update:model-value="change('scope', $event)" />
          <ModalSelect data-category-content-filter :model-value="filters.content" :options="contentOptions" :label="t('categories.contentFilter')" @update:model-value="change('content', $event)" />
          <ModalSelect :model-value="filters.iconType" :options="iconOptions" :label="t('categories.iconFilter')" @update:model-value="change('iconType', $event)" />
          <div class="min-w-0">
            <label :for="colorId" class="mb-2 block text-sm font-medium text-black/70 dark:text-white/70">{{ t('categories.color') }}</label>
            <div class="flex min-h-12 items-center gap-2 rounded-xl border border-black/10 bg-white px-2 dark:border-white/10 dark:bg-white/5">
              <input :id="colorId" :value="filters.color || '#3B82F6'" type="color" class="h-8 w-9 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0" @change="change('color', ($event.target as HTMLInputElement).value)" />
              <button type="button" class="min-w-0 flex-1 truncate text-left text-xs font-medium text-black/70 dark:text-white/70" @click="change('color', filters.color ? '' : '#3B82F6')">{{ filters.color ? filters.color.toUpperCase() : t('categories.anyColor') }}</button>
              <button v-if="filters.color" type="button" :aria-label="t('categories.clearColor')" class="h-8 w-8 shrink-0 rounded-lg text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10" @click="change('color', '')">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="chips.length" class="flex min-w-0 flex-wrap items-center gap-1.5">
      <span class="mr-1 text-xs text-black/50 dark:text-white/50">{{ t('categories.activeFilters') }}</span>
      <button v-for="chip in chips" :key="chip.key" type="button" class="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1.5 text-xs font-medium text-black/70 hover:bg-black/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15" @click="remove(chip.key)">
        <span class="min-w-0 truncate">{{ chip.label }}</span><span aria-hidden="true">×</span>
      </button>
    </div>
    </div>
  </CollapsibleFormSection>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import CollapsibleFormSection from '../../../components/common/CollapsibleFormSection.vue'
import CategoriesSmartFilter from './CategoriesSmartFilter.vue'
import ModalSelect from '../../../components/common/ModalSelect.vue'
import { defaultCategoryFilters, type CategoryFilters, type CategorySmartSummary } from '../interface/category.interface'

const props = defineProps<{ filters: CategoryFilters; hasFilters: boolean; smartSummary: CategorySmartSummary }>()
const emit = defineEmits<{ change: [value: Partial<CategoryFilters>]; reset: [] }>()
const { t } = useI18n()
const searchExpanded = ref(false)
const expanded = ref(false)
const uid = useId()
const searchId = 'category-search-' + uid
const panelId = 'category-filters-' + uid
const colorId = 'category-color-' + uid
const options = (values: string[], prefix: string) => values.map(value => ({ value, label: t('categories.' + prefix + value) }))
const pinOptions = computed(() => options(['all', 'pinned', 'unpinned'], 'pin_'))
const sortOptions = computed(() => options(['default', 'newest', 'oldest', 'nameAsc', 'nameDesc', 'mostWords', 'fewestWords', 'updated'], 'sort_'))
const scopeOptions = computed(() => options(['all', 'name', 'description', 'vocabulary'], 'scope_'))
const contentOptions = computed(() => options(['all', 'empty', 'populated'], 'content_'))
const iconOptions = computed(() => options(['all', 'preset', 'custom'], 'icon_'))
const advancedCount = computed(() => Number(props.filters.scope !== 'all') + Number(props.filters.content !== 'all') + Number(props.filters.iconType !== 'all') + Number(!!props.filters.color) + Number(props.filters.smart !== 'all'))
function change(key: keyof CategoryFilters, value: string | string[]) {
  if (typeof value === 'string') emit('change', { [key]: value })
}
function remove(key: keyof CategoryFilters) { change(key, defaultCategoryFilters()[key]) }
const chips = computed(() => {
  const f = props.filters
  const items: {key: keyof CategoryFilters; label: string}[] = []
  if (f.search.trim()) items.push({ key: 'search', label: f.search.trim() })
  for (const [key, prefix] of [['scope','scope_'], ['pinned','pin_'], ['content','content_'], ['iconType','icon_'], ['sort','sort_'], ['smart','smart_']] as const) {
    if (f[key] !== defaultCategoryFilters()[key]) items.push({key, label: t('categories.' + prefix + f[key])})
  }
  if (f.color) items.push({key: 'color', label: f.color.toUpperCase()})
  return items
})
</script>
