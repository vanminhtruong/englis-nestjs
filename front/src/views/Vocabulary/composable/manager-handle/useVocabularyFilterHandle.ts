import { watch } from 'vue'
import { vocabularyService } from '../../service/vocabulary.service'

export function useVocabularyFilterHandle(
  filter: {
    search: string;
    difficulty: 'all' | 'easy' | 'medium' | 'hard',
    tabId?: string | null,
    categoryIds?: string[],
    tags?: string[]
  },
  store: {
    setPage: (page: number) => void
    limit: number
  }
) {
  function handlePageChange(page: number) {
    store.setPage(page)
    const difficulty = (['easy', 'medium', 'hard'] as const).find(
      (level) => level === filter.difficulty,
    )
    vocabularyService.loadVocabularies({
      page,
      limit: store.limit,
      search: filter.search,
      difficulty,
      tabId: filter.tabId,
      categoryIds: filter.categoryIds,
      tags: filter.tags,
    })
  }

  watch(
    () => filter.search,
    () => {
      store.setPage(1)
      handlePageChange(1)
    },
  )

  watch(
    () => filter.difficulty,
    () => {
      store.setPage(1)
      handlePageChange(1)
    },
  )

  watch(
    () => filter.tabId,
    () => {
      store.setPage(1)
      handlePageChange(1)
    }
  )

  watch(
    () => filter.categoryIds,
    () => {
      store.setPage(1)
      handlePageChange(1)
    },
    { deep: true }
  )

  watch(
    () => filter.tags,
    () => {
      store.setPage(1)
      handlePageChange(1)
    },
    { deep: true }
  )

  return {
    handlePageChange,
  }
}
