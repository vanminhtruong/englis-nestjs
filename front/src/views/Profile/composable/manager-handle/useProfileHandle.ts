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
    let success = false

    if (result.success && result.data) {
      setProfile(result.data)
      authStore.updateUser(result.data)
      showSuccess(t('profile.messages.updateSuccess'))
      success = true
    } else if (!result.success && result.error) {
      showError(result.error || t('profile.messages.updateError'))
    }

    setSaving(false)
    return success
  }

  const handleProfileUpdatedFromWS = (updated: UserProfile) => {
    setProfile(updated)
    authStore.updateUser(updated)
  }

  const handleExport = async () => {
    const result = await profileService.exportData()
    if (result.success) {
      showSuccess(t('profile.messages.exportSuccess') || 'Data exported successfully')
    } else {
      showError(result.error || t('profile.messages.exportError') || 'Failed to export data')
    }
  }

  const handleImport = async (file: File) => {
    setLoading(true)
    const result = await profileService.importData(file)
    if (result.success) {
      if (result.noChanges) {
        showError(t('profile.messages.importNoChanges') || 'This data already exists')
      } else {
        const stats = result.stats
        if (stats) {
          const statsMessage = t('profile.messages.importStats', {
            new: stats.newVocabularies,
            updated: stats.updatedVocabularies,
            skipped: stats.skippedVocabularies,
          })
          showSuccess(`${t('profile.messages.importSuccess')}. ${statsMessage}`)
        } else {
          showSuccess(t('profile.messages.importSuccess') || 'Data imported successfully')
        }
        await loadProfile()
      }
    } else {
      showError(result.error || t('profile.messages.importError') || 'Failed to import data')
    }
    setLoading(false)
  }

  return {
    loadProfile,
    handleSave,
    handleProfileUpdatedFromWS,
    handleExport,
    handleImport,
  }
}
