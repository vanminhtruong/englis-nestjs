<template>
  <div class="flex flex-col md:flex-row gap-4 items-center">
    <div class="relative flex-1 w-full max-w-md">
      <input
        :value="search"
        type="text"
        :placeholder="labels.searchPlaceholder"
        class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        @input="onSearch"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40 dark:text-white/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <div class="relative">
      <button
        type="button"
        @click="emit('toggle-difficulty')"
        class="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between min-w-[160px]"
      >
        <span>{{ difficultyLabel }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="{ 'rotate-180': showDifficultyDropdown }">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div
        v-if="showDifficultyDropdown"
        class="absolute right-0 mt-2 w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg z-20 overflow-hidden"
      >
        <button
          v-for="option in difficultyOptions"
          :key="option.value"
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': currentDifficulty === option.value }"
          @click="emit('set-difficulty', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <button
      @click="emit('create')"
      class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all whitespace-nowrap"
    >
      {{ labels.addNew }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps<{
  search: string
  difficultyLabel: string
  showDifficultyDropdown: boolean
  currentDifficulty: 'all' | 'easy' | 'medium' | 'hard'
  labels: {
    searchPlaceholder: string
    addNew: string
    all: string
    easy: string
    medium: string
    hard: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'toggle-difficulty'): void
  (e: 'set-difficulty', value: 'all' | 'easy' | 'medium' | 'hard'): void
  (e: 'create'): void
}>()

const { search, difficultyLabel, showDifficultyDropdown, currentDifficulty, labels } = toRefs(props)

const difficultyOptions = [
  { value: 'all', label: labels.value.all },
  { value: 'easy', label: labels.value.easy },
  { value: 'medium', label: labels.value.medium },
  { value: 'hard', label: labels.value.hard },
]

function onSearch(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:search', target.value)
}
</script>

