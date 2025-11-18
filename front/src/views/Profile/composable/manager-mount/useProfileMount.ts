import { onMounted, onUnmounted } from 'vue'
import { profileService } from '../../service/profile.service'
import type { UserProfile } from '../../interface/profile.interface'

export function useProfileMount(
  loadProfile: () => Promise<void>,
  handleProfileUpdatedFromWS: (profile: UserProfile) => void,
) {
  onMounted(async () => {
    await loadProfile()
    profileService.setupWebSocketListeners(handleProfileUpdatedFromWS)
  })

  onUnmounted(() => {
    profileService.cleanupWebSocketListeners()
  })
}
