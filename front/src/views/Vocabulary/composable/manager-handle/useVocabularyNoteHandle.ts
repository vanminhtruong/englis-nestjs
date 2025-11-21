import { ref } from 'vue'
import { vocabularyService } from '../../service/vocabulary.service'

export function useVocabularyNoteHandle() {
    const isUpdating = ref(false)

    const updateNote = async (id: string, note: string) => {
        isUpdating.value = true
        try {
            const result = await vocabularyService.updateVocabulary(id, { note })
            if (!result.success) {
                console.error(result.error)
            }
            return result
        } finally {
            isUpdating.value = false
        }
    }

    return {
        updateNote,
        isUpdating
    }
}
