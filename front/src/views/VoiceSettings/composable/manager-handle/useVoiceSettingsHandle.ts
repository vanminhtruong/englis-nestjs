import { useI18n } from 'vue-i18n'
import { useToast } from '../../../../composables/useToast'
import type { VoiceViewModel } from '../../interface/voice-settings.interface'
import { voiceSettingsService } from '../../service/voice-settings.service'
import { getPreferredVoiceKey, setPreferredVoiceKey, speakPreferred } from '../../../../composables/usePreferredVoice'
import { useAuthStore } from '../../../../stores/auth.store'

let saveQueue: Promise<void> = Promise.resolve()
let saveVersion = 0

export function useVoiceSettingsHandle() {
  const { t } = useI18n()
  const { showSuccess, showError } = useToast()
  const auth = useAuthStore()

  function handlePreviewVoice(voice: VoiceViewModel, onDone?: () => void) {
    if (!('speechSynthesis' in window)) {
      showError(t('voiceSettings.previewNotSupported'))
      onDone?.()
      return
    }
    void speakPreferred(t('voiceSettings.previewSample'), { voiceKey: voice.key, lang: voice.languageCode, rate: 0.9, onDone })
  }

  function handleSavePreferredVoice(voiceKey: string) {
    const version = ++saveVersion
    const token = auth.token
    if (getPreferredVoiceKey() !== voiceKey) setPreferredVoiceKey(voiceKey)
    const task = saveQueue.then(async () => {
      if (version !== saveVersion || auth.token !== token) return
      try {
        await voiceSettingsService.savePreferredVoice(voiceKey)
        if (version === saveVersion && auth.token === token) {
          auth.updateUser({ preferredVoiceKey: voiceKey })
          showSuccess(t('voiceSettings.saveSuccess'))
        }
      } catch {
        if (version === saveVersion && auth.token === token) showError(t('voiceSettings.saveError'))
      }
    })
    saveQueue = task
    return task
  }

  return { handlePreviewVoice, handleSavePreferredVoice }
}
