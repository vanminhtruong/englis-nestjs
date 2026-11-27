<template>
  <div
    v-if="show"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-3 dark:bg-black/60 sm:p-4"
  >
    <div
      data-seasonal-dialog class="bg-white dark:bg-black rounded-2xl shadow-xl border border-black/10 dark:border-white/10 w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-4 sm:p-6 scrollbar-custom"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-black dark:text-white">
          {{ title }}
        </h2>
        <button
          @click="$emit('cancel')"
          class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <p class="text-sm text-black/70 dark:text-white/70 mb-4">
        {{ description }}
      </p>

      <div class="space-y-4 mb-6">
        <div>
          <div
            class="text-xs font-medium text-black/60 dark:text-white/60 mb-1"
          >
            {{ fromDateLabel }}
          </div>
          <div
            class="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-sm text-black dark:text-white"
          >
            {{ fromDateDisplay }} — {{ categoryName }}
          </div>
        </div>

        <div>
          <ModalSelect
            v-if="availableDates.length > 0"
            :model-value="selectedDate"
            :label="toDateLabel"
            :placeholder="placeholder"
            :options="[{ value: '', label: placeholder }, ...availableDates]"
            @update:model-value="$emit('select-date', String($event))"
          />

          <div
            v-else
            class="w-full px-4 py-3 rounded-xl border border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 italic flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span class="text-sm font-medium">{{ noDatesText }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold shadow hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!selectedDate"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import ModalSelect from "../../../components/common/ModalSelect.vue";
import { useModalScrollLock } from "../../../composables/useModalScrollLock";

const props = defineProps<{
  show: boolean;
  title: string;
  description: string;
  fromDateLabel: string;
  toDateLabel: string;
  fromDateDisplay: string;
  categoryName: string;
  selectedDateLabel: string;
  placeholder: string;
  availableDates: Array<{ value: string; label: string }>;
  selectedDate: string;
  showDropdown: boolean;
  cancelText: string;
  confirmText: string;
  noDatesText: string;
}>();

defineEmits<{
  "toggle-dropdown": [];
  "select-date": [date: string];
  cancel: [];
  confirm: [];
}>();

const { lockScroll, unlockScroll } = useModalScrollLock();

watch(
  () => props.show,
  (val) => {
    if (val) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }
);

</script>
