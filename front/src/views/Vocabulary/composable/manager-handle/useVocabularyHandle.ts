import { vocabularyService } from '../../service/vocabulary.service'
import type { VocabularyForm } from '../../interface/vocabulary.interface'
import { useToast } from '../../../../composables/useToast'
import { getPreferredVoice } from '../../../../composables/usePreferredVoice'
import { useI18n } from 'vue-i18n'

export function useVocabularyHandle(
  form: VocabularyForm,
  isEditing: { value: boolean },
  editingId: { value: string | null },
  closeModal: () => void,
  filter?: { tabId?: string | null }
) {
  const { showSuccess, showError, confirm } = useToast()
  const { t } = useI18n()
  async function handleSubmit() {
    // ... (same as before)
    if (!form.word || !form.pronunciation || !form.meaning) {
      showError('Please fill in required fields')
      return
    }

    const normalizedTags = typeof form.tags === 'string'
      ? (form.tags as string).split(',').map(t => t.trim()).filter(Boolean)
      : form.tags || []

    if (Array.isArray(normalizedTags) && normalizedTags.length > 3) {
      showError('Each vocabulary can have at most 3 tags')
      return
    }

    const data = {
      ...form,
      tags: normalizedTags,
    }

    let result
    if (isEditing.value && editingId.value) {
      result = await vocabularyService.updateVocabulary(editingId.value, data)
    } else {
      result = await vocabularyService.createVocabulary(data)
    }

    if (result.success) {
      if (!isEditing.value && filter) {
        // Old search/advanced filters must not hide a newly created word.
        const activeFilter = filter as typeof filter & {
          search?: string
          difficulty?: 'all' | 'easy' | 'medium' | 'hard'
          categoryIds?: string[]
          tags?: string[]
        }
        if (activeFilter.search !== undefined) activeFilter.search = ''
        if (activeFilter.difficulty !== undefined) activeFilter.difficulty = 'all'
        if (activeFilter.categoryIds !== undefined) activeFilter.categoryIds = []
        if (activeFilter.tags !== undefined) activeFilter.tags = []
      }
      showSuccess('Vocabulary saved successfully')
      closeModal()
    } else {
      showError(result.error || 'Failed to save vocabulary')
    }
  }

  function handleDelete(id: string) {
    // Deleting a vocabulary always deletes the record itself, including its
    // membership in all tabs. Moving a word between tabs is a separate action.
    const message = t('vocabulary.deleteConfirm');

    confirm(
      message,
      async () => {
        const result = await vocabularyService.deleteVocabulary(id)
        if (result.success) {
          showSuccess(t('vocabulary.deleteSuccess'))
        } else {
          showError(result.error || t('vocabulary.deleteError'))
        }
      },
      { label: t('vocabulary.delete'), type: 'error' },
    )
  }

  async function handleToggleFavorite(id: string) {
    const result = await vocabularyService.toggleFavorite(id)
    if (!result.success) {
      showError(result.error || 'Failed to update favorite')
    }
  }

  async function handleTogglePin(id: string) {
    const result = await vocabularyService.togglePin(id)
    if (!result.success) {
      showError(result.error || 'Failed to toggle pin')
      return
    }
    const isPinned = result.data?.isPinned
    if (typeof isPinned === 'boolean') {
      showSuccess(isPinned ? 'Vocabulary pinned to top' : 'Vocabulary unpinned')
    }
  }

  function handleSpeak(word: string) {
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(word)
    const voice = getPreferredVoice('en-US')
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else {
      utterance.lang = 'en-US'
    }
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  return {
    handleSubmit,
    handleDelete,
    handleToggleFavorite,
    handleTogglePin,
    handleSpeak,
  }
}
