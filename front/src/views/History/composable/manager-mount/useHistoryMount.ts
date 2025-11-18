import { onMounted, onUnmounted } from 'vue'
import { historyService } from '../../service/history.service'

export function useHistoryMount(
  loadHistory: () => Promise<void>,
  loadStatistics: () => Promise<void>,
  handleNewHistory: (history: any) => void,
  handleHistoryDeleted: (historyId: string) => void
) {
  onMounted(async () => {
    // Load initial data
    await Promise.all([loadHistory(), loadStatistics()])

    // Setup real-time listeners
    historyService.setupWebSocketListeners(handleNewHistory, handleHistoryDeleted)
  })

  onUnmounted(() => {
    // Cleanup WebSocket listeners khi component unmount
    historyService.cleanupWebSocketListeners()
  })
}
