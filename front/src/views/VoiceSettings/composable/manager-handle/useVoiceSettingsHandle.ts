import { useI18n } from 'vue-i18n'
import { useToast } from '../../../../composables/useToast'
import type { VoiceViewModel } from '../../interface/voice-settings.interface'
import { voiceSettingsService } from '../../service/voice-settings.service'
import { getPreferredVoice } from '../../../../composables/usePreferredVoice'

export function useVoiceSettingsHandle() {
  const { t } = useI18n()
  const { showSuccess, showError } = useToast()

  function handlePreviewVoice(voice: VoiceViewModel) {
    if (!('speechSynthesis' in window)) {
      showError(t('voiceSettings.previewNotSupported'))
      return
    }

    // Chọn voice trong browser theo language của cấu hình
    const browserVoice = getPreferredVoice(voice.languageCode || 'en-US')

    try {
      if (browserVoice) {
        localStorage.setItem('preferredVoiceURI', browserVoice.voiceURI)
      }
    } catch {
      // ignore storage error
    }

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
    showSuccess(t('voiceSettings.saveSuccess'))
  }

  return {
    handlePreviewVoice,
    handleSavePreferredVoice,
  }
}


