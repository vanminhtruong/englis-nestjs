import apiService from '../../../../services/api.service'
import { useAuthStore } from '../../../../stores/auth.store'
import type { VoiceViewModel, LanguageOption } from '../../interface/voice-settings.interface'

export function useVoiceSettingsMount(
  setVoices: (voices: VoiceViewModel[]) => void,
  setSelectedVoiceKey: (key: string) => void,
  setSelectedLanguage: (code: string) => void,
  setLanguages: (languages: LanguageOption[]) => void,
) {
  /**
   * Đọc preferredVoiceKey của user từ store (đã được load bởi AppHeader)
   * hoặc gọi API nếu chưa có, sau đó cập nhật selectedVoiceKey trong state.
   * Đây là cách đảm bảo voice đã lưu không bị mất khi F5.
   */
  async function loadVoices() {
    try {
      const authStore = useAuthStore()

      let preferredVoiceKey: string | null = authStore.user?.preferredVoiceKey ?? null

      // Nếu store chưa có (vd: không qua AppHeader), gọi API để lấy
      if (authStore.isAuthenticated && preferredVoiceKey === null) {
        const profileResponse = await apiService.auth.getProfile()
        preferredVoiceKey = profileResponse.data?.preferredVoiceKey ?? null
        authStore.updateUser({ preferredVoiceKey })
      }

      if (preferredVoiceKey) {
        setSelectedVoiceKey(preferredVoiceKey)
      }
    } catch {
      // Bỏ qua lỗi, UI vẫn dùng voice mặc định từ browser
    }
  }

  return {
    loadVoices,
  }
}
