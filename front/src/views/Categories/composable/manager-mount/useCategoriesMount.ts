import { onMounted, onUnmounted } from 'vue'
import { websocketService } from '../../../../services/websocket.service'
import { useAuthStore } from '../../../../stores/auth.store'

export function useCategoriesMount(load: () => Promise<void>, refresh: () => void) {
  const auth = useAuthStore()
  const events = ['category:created', 'category:updated', 'category:deleted', 'category:pinned', 'category:bulk-changed', 'vocabulary:created', 'vocabulary:updated', 'vocabulary:deleted', 'vocabulary:bydate:refresh', 'practice:completed', 'history:created']
  const onChange = (data?: { userId?: string }) => {
    if (data?.userId && auth.user?.id && data.userId !== auth.user.id) return
    refresh()
  }
  onMounted(() => {
    events.forEach(event => websocketService.on(event, onChange))
    void load()
  })
  onUnmounted(() => events.forEach(event => websocketService.off(event, onChange)))
}
