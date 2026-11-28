<template>
  <div class="min-h-screen bg-white px-3 py-4 dark:bg-black sm:p-4 md:p-8">
    <div class="mx-auto max-w-7xl" :class="selection.selectedIds.value.length ? 'pb-64 sm:pb-52 xl:pb-28' : ''">
      <div v-scroll-reveal ref="controlsRef">
        <CategoriesHeader :categories-count="query.totalCategories.value" @open-create-modal="state.openCreateModal" />
        <CategoriesFilters :filters="query.filters" :smart-summary="query.smartSummary.value" :has-filters="query.hasFilters.value" @change="query.updateFilters" @reset="query.resetFilters" />
      </div>

      <CategoriesListToolbar v-if="(!query.loading.value && !query.error.value && query.categories.value.length) || selection.mode.value"
        :result-label="t('categories.resultRange', { start: query.rangeStart.value, end: query.rangeEnd.value, total: query.total.value })"
        :page-label="t('categories.pageLabel', { page: query.page.value, total: query.pageCount.value })"
        :selection-mode="selection.mode.value" :selected-count="selection.selectedIds.value.length"
        :busy="selection.busy.value" :can-select-page="!query.loading.value && !query.error.value && !!query.categories.value.length"
        @toggle-mode="selection.toggleMode" @select-page="selection.toggleSelectAll" />
      <div v-if="query.loading.value" class="flex min-h-56 items-center justify-center" aria-busy="true"><AppLoading /></div>
      <div v-else-if="query.error.value" class="flex flex-col items-center rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
        <p class="text-sm font-semibold text-black dark:text-white">{{ t('categories.loadFailed') }}</p>
        <button type="button" class="mt-3 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white" @click="query.load">{{ t('categories.retry') }}</button>
      </div>
      <div v-else-if="!query.categories.value.length && query.hasFilters.value" class="flex flex-col items-center rounded-2xl border border-dashed border-black/15 px-4 py-12 text-center dark:border-white/15">
        <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6"/></svg>
        </span>
        <h3 class="text-lg font-bold text-black dark:text-white">{{ t('categories.noResults') }}</h3>
        <p class="mt-2 max-w-sm text-sm text-black/50 dark:text-white/50">{{ t('categories.noResultsHint') }}</p>
        <button type="button" class="mt-4 rounded-xl bg-black/5 px-4 py-2.5 text-sm font-semibold text-black hover:bg-black/10 dark:bg-white/10 dark:text-white" @click="query.resetFilters">{{ t('categories.resetFilters') }}</button>
      </div>
      <CategoriesEmpty v-else-if="!query.categories.value.length" />
      <template v-else>
        <CategoriesGrid :categories="query.categories.value" :smart-mode="query.filters.smart" :selection-mode="selection.mode.value" :selected-ids="selection.selectedSet.value" :selection-busy="selection.busy.value" @toggle-selection="selection.toggleSelection" @toggle-pin="handle.handleTogglePin" @open-edit-modal="state.openEditModal" @delete="handle.handleDelete" />
        <Pagination :page="query.page.value" :page-count="query.pageCount.value" @update:page="query.changePage" />
      </template>
      <CategoriesStickyButton :show-sticky-add-button="showStickyAddButton && !selection.mode.value" @open-create-modal="state.openCreateModal" />
      <CategoriesBulkActions :selected-count="selection.selectedIds.value.length" :is-all-selected="selection.isAllSelected.value" :busy="selection.busy.value" :can-select-page="!query.loading.value && !!query.categories.value.length" @action="selection.run" @toggle-page="selection.toggleSelectAll" @clear="selection.exitMode" />
      <CategoryModal :show="state.showModal.value" :is-editing="state.isEditing.value" :form="state.form" @submit="handle.handleSubmit" @close="state.closeModal" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCategoriesState } from './composable/manager-state/useCategoriesState'
import { useCategoriesQuery } from './composable/manager-state/useCategoriesQuery'
import { useCategoriesHandle } from './composable/manager-handle/useCategoriesHandle'
import { useCategoriesMount } from './composable/manager-mount/useCategoriesMount'
import { useCategoriesI18n } from './composable/manager-handle/useCategoriesI18n'
import { useCategoriesComponents } from './composable/manager-handle/useCategoriesComponents'
import { useIntersectionObserver } from './composable/manager-handle/useIntersectionObserver'
import { useCategorySelection } from './composable/manager-handle/useCategorySelection'
import CategoriesBulkActions from './component/CategoriesBulkActions.vue'
import CategoriesListToolbar from './component/CategoriesListToolbar.vue'
import CategoriesFilters from './component/CategoriesFilters.vue'
import Pagination from '../../components/Pagination.vue'

const { i18n: { t } } = useCategoriesI18n()
const { CategoriesHeader, AppLoading, CategoriesEmpty, CategoriesGrid, CategoriesStickyButton, CategoryModal } = useCategoriesComponents()
const state = useCategoriesState()
const query = useCategoriesQuery()
const refresh = () => query.schedule()
const selection = useCategorySelection(query.categories, query.filters, refresh)
const handle = useCategoriesHandle(state.form, state.isEditing, state.editingId, state.closeModal, refresh)
useCategoriesMount(query.load, refresh)
const controlsRef = ref<HTMLElement | null>(null)
const { showStickyAddButton } = useIntersectionObserver(controlsRef)
</script>
