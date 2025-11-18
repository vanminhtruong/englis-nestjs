import { watch } from 'vue'
import { useAuthStore } from '../../../../stores/auth.store'
import apiService from '../../../../services/api.service'

export function useCategoriesLayoutHandle(
  layoutMode: { value: 'grid' | 'list' },
  isPersistingLayout: { value: boolean }
) {
  const authStore = useAuthStore()

  watch(
    () => authStore.user?.categoriesLayout,
    (newLayout) => {
      if (newLayout) {
        layoutMode.value = newLayout
      } else if (!authStore.user) {
        layoutMode.value = 'grid'
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
      await apiService.auth.updateCategoriesLayout(mode)
      authStore.updateUser({ categoriesLayout: mode })
    } catch (error) {
      console.error('Failed to update categories layout preference:', error)
      layoutMode.value = previousLayout
    } finally {
      isPersistingLayout.value = false
    }
  }

  return {
    handleLayoutModeChange,
  }
}
