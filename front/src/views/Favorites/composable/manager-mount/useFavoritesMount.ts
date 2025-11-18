import { onMounted, onUnmounted } from 'vue'
import { websocketService } from '../../../../services/websocket.service'

export function useFavoritesMount(loadFavorites: (p?: number) => Promise<void>) {
  let refresh: () => void
  onMounted(async () => {
    await loadFavorites()
    refresh = () => loadFavorites()
    websocketService.on('vocabulary:created', refresh)
    websocketService.on('vocabulary:updated', refresh)
    websocketService.on('vocabulary:deleted', refresh)
    websocketService.on('vocabulary:favorited', refresh)
  })

  onUnmounted(() => {
    if (refresh) {
      websocketService.off('vocabulary:created', refresh)
      websocketService.off('vocabulary:updated', refresh)
      websocketService.off('vocabulary:deleted', refresh)
      websocketService.off('vocabulary:favorited', refresh)
    }
  })
}
