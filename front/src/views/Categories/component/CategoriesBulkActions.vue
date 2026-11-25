<template>
  <BulkActionBar :selected-count="selectedCount" :is-all-selected="isAllSelected" :is-deleting="busy" :select-page-disabled="!canSelectPage"
    :labels="{ selected: t('categories.selectedItems', {count: selectedCount}), hint: t('categories.bulkHint'), processing: t('categories.bulkProcessing'), delete: t('categories.bulkDelete'), selectAll: t('categories.selectPage'), deselectAll: t('categories.deselectPage'), clear: t('categories.clearSelection') }"
    @delete-selected="$emit('action', 'delete')" @toggle-select-all="$emit('toggle-page')" @clear-selection="$emit('clear')">
    <template #actions>
      <button type="button" data-category-bulk-pin :disabled="busy" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-lg hover:shadow-primary-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm" @click="$emit('action', 'pin')">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3 21 8l-5 1-4 4-1 4-4-4-4-4 4-1 4-4 1-5M7 13l-5 5"/></svg>
        {{ t('categories.bulkPin') }}
      </button>
      <button type="button" data-category-bulk-unpin :disabled="busy" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:px-4 sm:text-sm" @click="$emit('action', 'unpin')">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18M16 3l5 5-5 1-2 2M8 8 3 9l8 8 1-4M7 13l-5 5"/></svg>
        {{ t('categories.bulkUnpin') }}
      </button>
    </template>
  </BulkActionBar>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BulkActionBar from '../../../components/common/BulkActionBar.vue'
import type { CategoryBulkAction } from '../interface/category.interface'
const { t } = useI18n()
defineProps<{ selectedCount: number; isAllSelected: boolean; busy: boolean; canSelectPage: boolean }>()
defineEmits<{ action: [action: CategoryBulkAction]; 'toggle-page': []; clear: [] }>()
</script>
