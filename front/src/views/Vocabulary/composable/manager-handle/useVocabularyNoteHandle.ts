import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '../../../../composables/useToast'
import { vocabularyService } from '../../service/vocabulary.service'

export function useVocabularyNoteHandle() {
    const isUpdating = ref(false)
    const { t } = useI18n()
    const { showError, showSuccess } = useToast()

    const updateNote = async (id: string, note: string) => {
        if (isUpdating.value) return
        isUpdating.value = true
        try {
            const result = await vocabularyService.updateVocabulary(id, { note })
            if (result.success && result.data) {
                showSuccess(t('vocabulary.note.saved'))
            } else {
                showError(t('vocabulary.note.saveError'))
                return { success: false }
            }
            return result
        } catch {
            showError(t('vocabulary.note.saveError'))
            return { success: false }
        } finally {
            isUpdating.value = false
        }
    }

    return {
        updateNote,
        isUpdating
    }
}
