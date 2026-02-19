export interface VoiceOption {
  id: string
  key: string
  name: string
  languageCode: string
  gender: 'male' | 'female' | 'neutral'
  provider: string
  isDefault: boolean
  isActive: boolean
  isPreferred?: boolean
}

export interface VoiceViewModel {
  id: string
  key: string
  displayName: string
  languageCode: string
  provider: string
}

export interface LanguageOption {
  code: string
  label: string
}

export interface VoiceSettingsState {
  voices: VoiceViewModel[]
  languages: LanguageOption[]
  selectedLanguage: string
  selectedVoiceKey: string
}


