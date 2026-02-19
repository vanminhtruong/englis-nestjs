import { useI18n } from 'vue-i18n'
import { useToast } from '../../../../composables/useToast'
import type { VoiceViewModel } from '../../interface/voice-settings.interface'
import { voiceSettingsService } from '../../service/voice-settings.service'
import { getPreferredVoice } from '../../../../composables/usePreferredVoice'
import { useAuthStore } from '../../../../stores/auth.store'

export function useVoiceSettingsHandle() {
  const { t } = useI18n()
  const { showSuccess, showError } = useToast()

  function handlePreviewVoice(voice: VoiceViewModel) {
    if (!('speechSynthesis' in window)) {
      showError(t('voiceSettings.previewNotSupported'))
      return
    }

    // Lấy tất cả browser voices
    const allVoices = window.speechSynthesis.getVoices()

    // Tìm chính xác voice theo voiceURI (key)
    let browserVoice = allVoices.find((v) => v.voiceURI === voice.key)

    // Nếu không tìm thấy, thử tìm theo tên
    if (!browserVoice) {
      browserVoice = allVoices.find((v) => v.name === voice.displayName?.split(' · ')[0])
    }

    // Fallback: tìm theo language code
    if (!browserVoice) {
      browserVoice = getPreferredVoice(voice.languageCode || 'en-US') ?? undefined
    }

    try {
      if (browserVoice) {
        localStorage.setItem('preferredVoiceURI', browserVoice.voiceURI)
      }
    } catch {
      // ignore storage error
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(t('voiceSettings.previewSample'))
    if (browserVoice) {
      utterance.voice = browserVoice
      utterance.lang = browserVoice.lang
    } else {
      utterance.lang = voice.languageCode || 'en-US'
    }
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  async function handleSavePreferredVoice(voiceKey: string) {
    await voiceSettingsService.savePreferredVoice(voiceKey)
    // Cập nhật authStore để state frontend đồng bộ với backend
    const authStore = useAuthStore()
    authStore.updateUser({ preferredVoiceKey: voiceKey })
    showSuccess(t('voiceSettings.saveSuccess'))
  }

  return {
    handlePreviewVoice,
    handleSavePreferredVoice,
  }
}


