import { onMounted, onUnmounted } from 'vue'
import { vocabularyService } from '../../service/vocabulary.service'

interface MountOptions {
  onMounted?: () => void | Promise<void>
}

export function useVocabularyMount(options?: MountOptions) {
  onMounted(async () => {
    await vocabularyService.loadVocabularies()
    vocabularyService.setupWebSocketListeners()

    // Execute additional onMounted callbacks
    if (options?.onMounted) {
      await options.onMounted()
    }
  })

  onUnmounted(() => {
    vocabularyService.cleanupWebSocketListeners()
  })
}
