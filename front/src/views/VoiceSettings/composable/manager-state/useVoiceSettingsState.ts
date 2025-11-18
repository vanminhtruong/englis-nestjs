import { reactive } from 'vue'
import type { VoiceSettingsState, VoiceViewModel, LanguageOption } from '../../interface/voice-settings.interface'

const state = reactive<VoiceSettingsState>({
  voices: [],
  languages: [],
  selectedLanguage: '',
  selectedVoiceKey: '',
})

export function useVoiceSettingsState() {
  function setVoices(voices: VoiceViewModel[]) {
    state.voices = voices
  }

  function setLanguages(languages: LanguageOption[]) {
    state.languages = languages
  }

  function setSelectedLanguage(code: string) {
    state.selectedLanguage = code
  }

  function setSelectedVoiceKey(key: string) {
    state.selectedVoiceKey = key
  }

  return {
    state,
    setVoices,
    setLanguages,
    setSelectedLanguage,
    setSelectedVoiceKey,
  }
}


