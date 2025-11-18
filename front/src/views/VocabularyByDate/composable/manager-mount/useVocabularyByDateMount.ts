import { onMounted, onUnmounted } from 'vue'
import { vocabularyByDateService } from '../../service/vocabulary-by-date.service'

export function useVocabularyByDateMount(loadData: () => void) {
  const handleRefresh = () => {
    loadData()
  }

  onMounted(() => {
    loadData()
    vocabularyByDateService.setupWebSocketListeners(handleRefresh)
  })

  onUnmounted(() => {
    vocabularyByDateService.cleanupWebSocketListeners(handleRefresh)
  })
}
