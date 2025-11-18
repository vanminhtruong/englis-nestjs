import { ref } from 'vue'
import type { VocabularyByDate } from '../../interface/vocabulary-by-date.interface'

export function useVocabularyByDateState() {
  const vocabulariesByDate = ref<VocabularyByDate[]>([])
  const loading = ref(false)
  const expandedDates = ref<Set<string>>(new Set())
  const expandedCategories = ref<Set<string>>(new Set())
  const expandAll = ref(false)
  const searchQuery = ref('')

  return {
    vocabulariesByDate,
    loading,
    expandedDates,
    expandedCategories,
    expandAll,
    searchQuery,
  }
}
