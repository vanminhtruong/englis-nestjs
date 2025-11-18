import { profileService } from '../../service/profile.service'
import type { Ref } from 'vue'
import type { UserProfile } from '../../interface/profile.interface'
import { useToast } from '../../../../composables/useToast'
import { useAuthStore } from '../../../../stores/auth.store'
import { useI18n } from 'vue-i18n'

export function useProfileHandle(
  profile: Ref<UserProfile | null>,
  form: { fullName: string; email: string; avatar: string; theme: string },
  setProfile: (data: UserProfile) => void,
  setLoading: (value: boolean) => void,
  setSaving: (value: boolean) => void,
) {
  const { showSuccess, showError } = useToast()
  const authStore = useAuthStore()
  const { t } = useI18n()

  const loadProfile = async () => {
    setLoading(true)
    const result = await profileService.loadProfile()
    if (result.success && result.data) {
      setProfile(result.data)
      authStore.updateUser(result.data)
    } else if (!result.success && result.error) {
      showError(result.error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload: Partial<UserProfile> = {
      fullName: form.fullName,
      avatar: form.avatar || undefined,
      theme: form.theme,
    }

    const result = await profileService.updateProfile(payload)

    if (result.success && result.data) {
      setProfile(result.data)
      authStore.updateUser(result.data)
      showSuccess(t('profile.messages.updateSuccess'))
    } else if (!result.success && result.error) {
      showError(result.error || t('profile.messages.updateError'))
    }

    setSaving(false)
  }

  const handleProfileUpdatedFromWS = (updated: UserProfile) => {
    setProfile(updated)
    authStore.updateUser(updated)
  }

  return {
    loadProfile,
    handleSave,
    handleProfileUpdatedFromWS,
  }
}
