<template>
  <BulkActionBar :selected-count="selectedCount" :is-all-selected="isAllSelected" :is-deleting="isDeleting"
    :labels="{ selected: t('vocabulary.selectedItems', {count: selectedCount}), hint: t('vocabulary.chooseBulkAction'), processing: t('vocabulary.processingSelection'), delete: t('vocabulary.deleteSelected'), selectAll: t('vocabulary.selectAll'), deselectAll: t('vocabulary.deselectAll'), clear: t('vocabulary.clearSelection') }"
    @delete-selected="$emit('delete-selected')" @toggle-select-all="$emit('toggle-select-all')" @clear-selection="$emit('clear-selection')">
    <template #actions>
          <button
            type="button"
            :disabled="isDeleting"
            @click="$emit('add-to-tab')"
            class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-lg hover:shadow-primary-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <path d="M12 11v6m-3-3h6" />
            </svg>
            {{ t("vocabulary.addToTab") }}
          </button>
    </template>
  </BulkActionBar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BulkActionBar from '../../../components/common/BulkActionBar.vue'
const { t } = useI18n()
defineProps<{ selectedCount: number; isAllSelected: boolean; isDeleting: boolean }>()
defineEmits<{ 'add-to-tab': []; 'delete-selected': []; 'toggle-select-all': []; 'clear-selection': [] }>()
</script>