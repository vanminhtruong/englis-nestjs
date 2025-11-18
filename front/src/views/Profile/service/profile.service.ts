import apiService from '../../../services/api.service'
import { websocketService } from '../../../services/websocket.service'
import type { UserProfile } from '../interface/profile.interface'
import { useAuthStore } from '../../../stores/auth.store'

export class ProfileService {
  private profileUpdatedCallback: ((data: { userId: string; profile: UserProfile }) => void) | null = null

  async loadProfile(): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    try {
      const response = await apiService.auth.getProfile()
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load profile',
      }
    }
  }

  async updateProfile(payload: Partial<UserProfile>): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    try {
      const response = await apiService.auth.updateProfile(payload)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
      }
    }
  }

  setupWebSocketListeners(onProfileUpdated: (profile: UserProfile) => void) {
    this.cleanupWebSocketListeners()

    const authStore = useAuthStore()

    this.profileUpdatedCallback = (data: { userId: string; profile: UserProfile }) => {
      if (!authStore.user || data.userId !== authStore.user.id) return
      onProfileUpdated(data.profile)
    }

    websocketService.on('user:profile:updated', this.profileUpdatedCallback)
  }

  cleanupWebSocketListeners() {
    if (this.profileUpdatedCallback) {
      websocketService.off('user:profile:updated', this.profileUpdatedCallback)
      this.profileUpdatedCallback = null
    }
  }
}

export const profileService = new ProfileService()
