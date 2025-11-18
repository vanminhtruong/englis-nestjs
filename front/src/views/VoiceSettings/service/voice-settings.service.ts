import apiService from '../../../services/api.service'
import type { VoiceOption } from '../interface/voice-settings.interface'

export const voiceSettingsService = {
  async getVoices(): Promise<VoiceOption[]> {
    const response = await apiService.voice.getAll()
    return response.data
  },

  async savePreferredVoice(voiceKey: string) {
    await apiService.voice.setPreferred(voiceKey)
  },
}


