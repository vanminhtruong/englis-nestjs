import { favoritesService } from '../../service/favorites.service'
import { useI18n } from 'vue-i18n'
import { getPreferredVoice } from '../../../../composables/usePreferredVoice'

export function useFavoritesHandle(
  setFavorites: (data: any[]) => void,
  removeFavorite: (id: string) => void,
  setLoading: (value: boolean) => void,
  setMeta: (meta: { page: number; limit: number; total: number; pageCount: number }) => void,
  page: { value: number },
  limit: { value: number },
) {
  const { locale } = useI18n()
  async function loadFavorites(p?: number) {
    setLoading(true)
    const result = await favoritesService.loadFavorites({
      page: p ?? page.value,
      limit: limit.value,
    })
    if (result.success) {
      setFavorites(result.data)
      if (result.meta) setMeta(result.meta)
    } else {
      console.error('Failed to load favorites:', result.error)
    }
    setLoading(false)
  }

  async function handleToggleFavorite(id: string) {
    const result = await favoritesService.toggleFavorite(id)
    if (result.success) {
      removeFavorite(id)
    } else {
      alert(result.error)
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

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'vi': 'vi-VN',
      'ko': 'ko-KR' 
    }
    return date.toLocaleDateString(localeMap[locale.value] || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return {
    loadFavorites,
    handleToggleFavorite,
    handleSpeak,
    formatDate,
  }
}
