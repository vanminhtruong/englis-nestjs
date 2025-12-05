<template>
  <div
    v-if="show"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 dark:bg-black/60"
  >
    <div class="bg-white dark:bg-black rounded-2xl shadow-xl border border-black/10 dark:border-white/10 w-full max-w-md p-6">
      <h2 class="text-xl font-semibold text-black dark:text-white mb-4">
        {{ title }}
      </h2>
      <p class="text-sm text-black/70 dark:text-white/70 mb-4">
        {{ description }}
      </p>

      <div class="space-y-4 mb-6">
        <div>
          <div class="text-xs font-medium text-black/60 dark:text-white/60 mb-1">
            {{ fromDateLabel }}
          </div>
          <div class="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-sm text-black dark:text-white">
            {{ fromDateDisplay }} — {{ categoryName }}
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">
            {{ toDateLabel }}
          </label>
          <div class="relative">
            <button
              type="button"
              @click="toggleDropdown"
              class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
            >
              <span class="text-sm truncate">
                {{ selectedDateLabel }}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="{ 'rotate-180': showDropdown }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div
              v-if="showDropdown"
              class="absolute z-10 w-full mt-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            >
              <button
                type="button"
                class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white text-sm"
                @click="$emit('select-date', '')"
              >
                -- {{ placeholder }} --
              </button>
              <button
                v-for="date in availableDates"
                :key="date.value"
                type="button"
                class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
                :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedDate === date.value }"
                @click="$emit('select-date', date.value)"
              >
                <span class="text-black dark:text-white">{{ date.label }}</span>
              </button>
            </div>
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
defineProps<{
  show: boolean
  title: string
  description: string
  fromDateLabel: string
  toDateLabel: string
  fromDateDisplay: string
  categoryName: string
  selectedDateLabel: string
  placeholder: string
  availableDates: Array<{ value: string; label: string }>
  selectedDate: string
  showDropdown: boolean
  cancelText: string
  confirmText: string
}>()

defineEmits<{
  'toggle-dropdown': []
  'select-date': [date: string]
  cancel: []
  confirm: []
}>()

function toggleDropdown() {
  // Emit to parent
}
</script>
