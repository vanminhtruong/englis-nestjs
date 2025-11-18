import { voiceSettingsService } from '../../service/voice-settings.service'
import type { VoiceOption, VoiceViewModel, LanguageOption } from '../../interface/voice-settings.interface'

export function useVoiceSettingsMount(
  setVoices: (voices: VoiceViewModel[]) => void,
  setSelectedVoiceKey: (key: string) => void,
  setSelectedLanguage: (code: string) => void,
  setLanguages: (languages: LanguageOption[]) => void,
) {
  async function loadVoices() {
    // Hiện tại danh sách voice dùng trực tiếp từ Browser voices (Web Speech API)
    // Hàm này chỉ gọi API để đảm bảo backend sẵn sàng, tránh override state ở frontend.
    try {
      await voiceSettingsService.getVoices()
    } catch {
      // bỏ qua lỗi, UI vẫn dùng voice từ browser
    }
  }

  return {
    loadVoices,
  }
}


