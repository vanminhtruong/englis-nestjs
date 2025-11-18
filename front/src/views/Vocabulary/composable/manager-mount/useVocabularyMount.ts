import { onMounted, onUnmounted } from 'vue'
import { vocabularyService } from '../../service/vocabulary.service'

export function useVocabularyMount() {
  onMounted(async () => {
    await vocabularyService.loadVocabularies()
    vocabularyService.setupWebSocketListeners()
  })

  onUnmounted(() => {
    vocabularyService.cleanupWebSocketListeners()
  })
}
