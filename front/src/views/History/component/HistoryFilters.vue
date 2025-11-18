<template>
  <div class="flex flex-col md:flex-row gap-4 mb-6">
    <!-- Action Dropdown -->
    <div class="relative w-full md:w-64">
      <button
        type="button"
        @click="showActionDropdown = !showActionDropdown"
        class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
      >
        <span class="truncate">{{ actionLabel }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="{ 'rotate-180': showActionDropdown }">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div
        v-if="showActionDropdown"
        class="absolute z-10 w-full mt-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
      >
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm text-black dark:text-white"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'all' }"
          @click="selectAction('all')"
        >
          All Actions
        </button>
        <div class="px-4 pt-2 pb-1 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Vocabulary</div>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'vocabulary_created' }"
          @click="selectAction('vocabulary_created')"
        >
          Created
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'vocabulary_updated' }"
          @click="selectAction('vocabulary_updated')"
        >
          Updated
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'vocabulary_deleted' }"
          @click="selectAction('vocabulary_deleted')"
        >
          Deleted
        </button>
        <div class="px-4 pt-2 pb-1 text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Practice</div>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'practice_flashcard' }"
          @click="selectAction('practice_flashcard')"
        >
          Flashcard
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'practice_multiple_choice' }"
          @click="selectAction('practice_multiple_choice')"
        >
          Multiple Choice
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'practice_typing' }"
          @click="selectAction('practice_typing')"
        >
          Typing
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.action === 'practice_listening' }"
          @click="selectAction('practice_listening')"
        >
          Listening
        </button>
      </div>
    </div>

    <!-- Date Range Dropdown -->
    <div class="relative w-full md:w-56">
      <button
        type="button"
        @click="showDateDropdown = !showDateDropdown"
        class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
      >
        <span class="truncate">{{ dateLabel }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="{ 'rotate-180': showDateDropdown }">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div
        v-if="showDateDropdown"
        class="absolute z-10 w-full mt-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
      >
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.dateRange === 'all' }"
          @click="selectDate('all')"
        >
          {{ t('history.filter.all') }}
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.dateRange === 'today' }"
          @click="selectDate('today')"
        >
          {{ t('history.filter.today') }}
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.dateRange === 'week' }"
          @click="selectDate('week')"
        >
          {{ t('history.filter.week') }}
        </button>
        <button
          type="button"
          class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': modelValue.dateRange === 'month' }"
          @click="selectDate('month')"
        >
          {{ t('history.filter.month') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HistoryFilter } from '../interface'

const props = defineProps<{
  modelValue: HistoryFilter
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HistoryFilter]
}>()

const { t } = useI18n()

const showActionDropdown = ref(false)
const showDateDropdown = ref(false)

const actionLabel = computed(() => {
  switch (props.modelValue.action) {
    case 'vocabulary_created': return 'Created'
    case 'vocabulary_updated': return 'Updated'
    case 'vocabulary_deleted': return 'Deleted'
    case 'practice_flashcard': return 'Flashcard'
    case 'practice_multiple_choice': return 'Multiple Choice'
    case 'practice_typing': return 'Typing'
    case 'practice_listening': return 'Listening'
    default: return 'All Actions'
  }
})

const dateLabel = computed(() => {
  switch (props.modelValue.dateRange) {
    case 'today': return t('history.filter.today')
    case 'week': return t('history.filter.week')
    case 'month': return t('history.filter.month')
    default: return t('history.filter.all')
  }
})

function selectAction(value: any) {
  emit('update:modelValue', { ...props.modelValue, action: value })
  showActionDropdown.value = false
}

function selectDate(value: any) {
  emit('update:modelValue', { ...props.modelValue, dateRange: value })
  showDateDropdown.value = false
}
</script>

<script lang="ts">
export default {
  name: 'HistoryFilters'
}
</script>
