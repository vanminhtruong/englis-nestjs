import { watch } from 'vue'
import { vocabularyService } from '../../service/vocabulary.service'

export function useVocabularyFilterHandle(
  filter: { search: string; difficulty: 'all' | 'easy' | 'medium' | 'hard' },
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
      search: filter.search || undefined,
      difficulty,
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

  return {
    handlePageChange,
  }
}

