<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-4 left-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 sm:bottom-6 sm:w-max"
    >
      <div
        class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-black sm:p-4 lg:flex-row lg:items-center lg:gap-4"
      >
        <!-- Summary is kept separate from action buttons so neither gets squeezed. -->
        <div class="flex min-w-0 items-center gap-3 lg:shrink-0">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-base font-bold text-white"
          >
            {{ selectedCount }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold leading-5 text-gray-900 dark:text-white">
              {{ t("vocabulary.selectedItems", { count: selectedCount }) }}
            </p>
            <p class="text-xs leading-5 text-gray-500 dark:text-white/50">
              {{ t("vocabulary.chooseBulkAction") }}
            </p>
          </div>
        </div>

        <div class="h-px w-full shrink-0 bg-gray-200 dark:bg-white/10 lg:h-10 lg:w-px"></div>

        <div class="grid grid-cols-2 gap-2 lg:flex lg:flex-nowrap lg:items-center">
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

          <button
            type="button"
            :disabled="isDeleting"
            @click="$emit('delete-selected')"
            class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 sm:px-4 sm:text-sm"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7" />
            </svg>
            {{ isDeleting ? t("vocabulary.processingSelection") : t("vocabulary.deleteSelected") }}
          </button>

          <button
            type="button"
            :disabled="isDeleting"
            @click="$emit('toggle-select-all')"
            class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:px-4 sm:text-sm"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m9 11 3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            {{ isAllSelected ? t("vocabulary.deselectAll") : t("vocabulary.selectAll") }}
          </button>

          <button
            type="button"
            :disabled="isDeleting"
            @click="$emit('clear-selection')"
            class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-red-400 sm:w-11 sm:px-0"
            :title="t('vocabulary.clearSelection')"
            :aria-label="t('vocabulary.clearSelection')"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            <span class="sm:sr-only">{{ t("vocabulary.clearSelection") }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  selectedCount: number;
  isAllSelected: boolean;
  isDeleting: boolean;
}>();

defineEmits<{
  "add-to-tab": [];
  "delete-selected": [];
  "toggle-select-all": [];
  "clear-selection": [];
}>();
</script>
