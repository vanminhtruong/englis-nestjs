import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Vocabulary {
  id: string
  word: string
  pronunciation: string
  meaning: string
  example?: string
  exampleTranslation?: string
  note?: string
  image?: string
  audio?: string
  difficulty: 'easy' | 'medium' | 'hard'
  masteryLevel: 'new' | 'learning' | 'familiar' | 'mastered'
  correctCount: number
  incorrectCount: number
  isFavorite: boolean
  isPinned?: boolean
  pinnedAt?: string | null
  tags?: string[]
  categories?: any[]
  createdAt: string
  updatedAt: string
  lastReviewedAt?: string
  nextReviewAt?: string
}

export const useVocabularyStore = defineStore('vocabulary', () => {
  const vocabularies = ref<Vocabulary[]>([])
  const loading = ref(false)
  const currentVocabulary = ref<Vocabulary | null>(null)
  const page = ref(1)
  const limit = ref(6)
  const total = ref(0)
  const pageCount = ref(1)

  function setVocabularies(data: Vocabulary[]) {
    vocabularies.value = data
  }

  function setMeta(meta: { page: number; limit: number; total: number; pageCount: number }) {
    page.value = meta.page
    limit.value = meta.limit
    total.value = meta.total
    pageCount.value = meta.pageCount
  }

  function setPage(p: number) {
    page.value = p
  }

  function setLimit(l: number) {
    limit.value = l
  }

  function addVocabulary(vocabulary: Vocabulary) {
    vocabularies.value.unshift(vocabulary)
  }

  function updateVocabulary(id: string, data: Partial<Vocabulary>) {
    const index = vocabularies.value.findIndex((v) => v.id === id)
    if (index !== -1) {
      vocabularies.value[index] = { ...vocabularies.value[index], ...data } as Vocabulary
    }
  }

  function removeVocabulary(id: string) {
    vocabularies.value = vocabularies.value.filter((v) => v.id !== id)
  }

  function setCurrentVocabulary(vocabulary: Vocabulary | null) {
    currentVocabulary.value = vocabulary
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  return {
    vocabularies,
    loading,
    currentVocabulary,
    page,
    limit,
    total,
    pageCount,
    setVocabularies,
    setMeta,
    setPage,
    setLimit,
    addVocabulary,
    updateVocabulary,
    removeVocabulary,
    setCurrentVocabulary,
    setLoading,
  }
})
