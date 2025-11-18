import { onMounted, onUnmounted } from 'vue'
import { categoriesService } from '../../service/categories.service'

export function useCategoriesMount(
  setCategories: (data: any[]) => void,
  setLoading: (value: boolean) => void,
  addCategory: (category: any) => void,
  updateCategory: (id: string, category: any) => void,
  removeCategory: (id: string) => void
) {
  onMounted(async () => {
    setLoading(true)
    const result = await categoriesService.loadCategories()
    if (result.success) {
      setCategories(result.data)
    }
    setLoading(false)

    // Setup websocket listeners
    categoriesService.setupWebSocketListeners(
      (category) => {
        // Chỉ thêm nếu từ user khác (tránh duplicate)
        addCategory(category)
      },
      (category) => {
        updateCategory(category.id, category)
      },
      (data) => {
        removeCategory(data.id)
      }
    )
  })

  onUnmounted(() => {
    categoriesService.cleanupWebSocketListeners()
  })
}
