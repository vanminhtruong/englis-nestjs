<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
    <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
      {{ title }}
    </h1>
    <div class="hidden sm:flex justify-end">
      <div class="flex items-center rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5 shadow-sm">
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all"
          :class="[
            isGridLayout
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-primary-500/30 shadow-lg'
              : 'text-black dark:text-white hover:bg-primary-50 dark:hover:bg-white/10',
            isPersistingLayout ? 'opacity-70 cursor-wait' : ''
          ]"
          :aria-pressed="isGridLayout"
          :disabled="isPersistingLayout"
          :title="gridLabel"
          @click="emit('change:layout', 'grid')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="3" width="7" height="7" rx="2"></rect>
            <rect x="14" y="3" width="7" height="7" rx="2"></rect>
            <rect x="3" y="14" width="7" height="7" rx="2"></rect>
            <rect x="14" y="14" width="7" height="7" rx="2"></rect>
          </svg>
          <span class="hidden sm:inline whitespace-nowrap">{{ gridLabel }}</span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all"
          :class="[
            !isGridLayout
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-primary-500/30 shadow-lg'
              : 'text-black dark:text-white hover:bg-primary-50 dark:hover:bg-white/10',
            isPersistingLayout ? 'opacity-70 cursor-wait' : ''
          ]"
          :aria-pressed="!isGridLayout"
          :disabled="isPersistingLayout"
          :title="listLabel"
          @click="emit('change:layout', 'list')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <line x1="4" y1="6" x2="20" y2="6" stroke-linecap="round"></line>
            <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round"></line>
            <line x1="4" y1="18" x2="20" y2="18" stroke-linecap="round"></line>
          </svg>
          <span class="hidden sm:inline whitespace-nowrap">{{ listLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps<{
  title: string
  gridLabel: string
  listLabel: string
  isGridLayout: boolean
  isPersistingLayout: boolean
}>()

const emit = defineEmits<{
  (e: 'change:layout', value: 'grid' | 'list'): void
}>()

const { title, gridLabel, listLabel, isGridLayout, isPersistingLayout } = toRefs(props)
</script>
