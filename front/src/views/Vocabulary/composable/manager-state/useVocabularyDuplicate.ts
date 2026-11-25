import { ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import apiService from '../../../../services/api.service'
import type { PartOfSpeech } from '../../utils/partOfSpeech'

interface DuplicateMatch { id: string; word: string; meaning: string; partOfSpeech: PartOfSpeech }
export interface DuplicateResult { duplicate: boolean; total: number; matches: DuplicateMatch[] }

export function useVocabularyDuplicate(form: MaybeRefOrGetter<{word: string; meaning: string; partOfSpeech?: PartOfSpeech}>, visible: MaybeRefOrGetter<boolean>, excludeId: MaybeRefOrGetter<string | null | undefined>) {
  const result = ref<DuplicateResult | null>(null)
  const checking = ref(false)
  const unavailable = ref(false)
  watch(() => [toValue(visible), toValue(form).word, toValue(form).meaning, toValue(form).partOfSpeech, toValue(excludeId)] as const,
    ([show, word, meaning, partOfSpeech, id], _, onCleanup) => {
      result.value = null
      unavailable.value = false
      checking.value = !!show && !!word?.trim()
      if (!checking.value) return
      const controller = new AbortController()
      let current = true
      const timer = setTimeout(async () => {
        try {
          const response = await apiService.vocabulary.checkDuplicate({ word, meaning, partOfSpeech: partOfSpeech ?? 'unspecified', excludeId: id || undefined }, controller.signal)
          if (current) result.value = response.data
        } catch {
          if (current) unavailable.value = true
        } finally {
          if (current) checking.value = false
        }
      }, 350)
      onCleanup(() => { current = false; clearTimeout(timer); controller.abort() })
    }, { immediate: true })
  return { result, checking, unavailable }
}
