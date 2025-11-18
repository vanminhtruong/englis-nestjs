import { watch } from 'vue'
import { useAuthStore } from '../../../../stores/auth.store'
import apiService from '../../../../services/api.service'
import { vocabularyService } from '../../service/vocabulary.service'

const DEFAULT_GRID_LIMIT = 6
const LIST_VIEW_LIMIT = 5

export function useVocabularyLayoutHandle(
  layoutMode: { value: 'grid' | 'list' },
  filter: { search: string; difficulty: 'all' | 'easy' | 'medium' | 'hard' },
  store: {
    limit: number
    setLimit: (limit: number) => void
    setPage: (page: number) => void
  },
  isPersistingLayout: { value: boolean }
) {
  const authStore = useAuthStore()

  watch(
    () => authStore.user?.vocabularyLayout,
    (newLayout) => {
      if (newLayout) {
        layoutMode.value = newLayout
      } else if (!authStore.user) {
        layoutMode.value = 'grid'
      }
    },
    { immediate: true }
  )

  watch(
    () => layoutMode.value,
    (mode) => {
      const desiredLimit = mode === 'list' ? LIST_VIEW_LIMIT : DEFAULT_GRID_LIMIT
      if (store.limit !== desiredLimit) {
        store.setLimit(desiredLimit)
        store.setPage(1)
        const allowed: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard']
        const difficulty = allowed.find((d) => d === filter.difficulty)
        vocabularyService.loadVocabularies({
          page: 1,
          limit: desiredLimit,
          search: filter.search || undefined,
          difficulty,
        })
      }
    },
    { immediate: true }
  )

  async function handleLayoutModeChange(mode: 'grid' | 'list') {
    if (layoutMode.value === mode || isPersistingLayout.value) return

    const previousLayout = layoutMode.value
    layoutMode.value = mode

    if (!authStore.isAuthenticated) {
      return
    }

    try {
      isPersistingLayout.value = true
      await apiService.auth.updateVocabularyLayout(mode)
      authStore.updateUser({ vocabularyLayout: mode })
    } catch (error) {
      console.error('Failed to update vocabulary layout preference:', error)
      layoutMode.value = previousLayout
    } finally {
      isPersistingLayout.value = false
    }
  }

  return {
    handleLayoutModeChange,
  }
}

