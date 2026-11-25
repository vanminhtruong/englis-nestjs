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
      v-if="selectedCount > 0" data-bulk-action-bar
      class="fixed bottom-4 left-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 sm:bottom-6 sm:w-max"
    >
      <div
        class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-black sm:p-4 xl:flex-row xl:items-center xl:gap-4"
      >
        <!-- Summary is kept separate from action buttons so neither gets squeezed. -->
        <div class="flex min-w-0 items-center gap-3 xl:shrink-0">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-base font-bold text-white"
          >
            {{ selectedCount }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold leading-5 text-gray-900 dark:text-white">
              {{ labels.selected }}
            </p>
            <p class="text-xs leading-5 text-gray-500 dark:text-white/50">
              {{ labels.hint }}
            </p>
          </div>
        </div>

        <div class="h-px w-full shrink-0 bg-gray-200 dark:bg-white/10 xl:h-10 xl:w-px"></div>

        <div class="grid grid-cols-2 gap-2 xl:flex xl:flex-nowrap xl:items-center">
          <slot name="actions" />

          <button
            type="button"
            :disabled="isDeleting"
            data-bulk-delete @click="$emit('delete-selected')"
            class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 sm:px-4 sm:text-sm"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7" />
            </svg>
            {{ isDeleting ? labels.processing : labels.delete }}
          </button>

          <button
            type="button"
            :disabled="isDeleting || selectPageDisabled"
            data-bulk-select-page @click="$emit('toggle-select-all')"
            class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:px-4 sm:text-sm"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m9 11 3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            {{ isAllSelected ? labels.deselectAll : labels.selectAll }}
          </button>

          <button
            type="button"
            :disabled="isDeleting"
            data-bulk-clear @click="$emit('clear-selection')"
            class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20 dark:hover:text-red-400 sm:w-11 sm:px-0"
            :title="labels.clear"
            :aria-label="labels.clear"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            <span class="sm:sr-only">{{ labels.clear }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">




defineProps<{
  selectedCount: number;
  isAllSelected: boolean;
  isDeleting: boolean;
  selectPageDisabled?: boolean;
  labels: { selected: string; hint: string; processing: string; delete: string; selectAll: string; deselectAll: string; clear: string };
}>();

defineEmits<{
  "add-to-tab": [];
  "delete-selected": [];
  "toggle-select-all": [];
  "clear-selection": [];
}>();
</script>
