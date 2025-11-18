import { ref, reactive } from 'vue'
import type { UserProfile } from '../../interface/profile.interface'

export function useProfileState() {
  const profile = ref<UserProfile | null>(null)
  const loading = ref(true)
  const saving = ref(false)

  const form = reactive({
    fullName: '',
    email: '',
    avatar: '',
    theme: 'light' as string,
  })

  function setProfile(data: UserProfile) {
    profile.value = data
    form.fullName = data.fullName
    form.email = data.email
    form.avatar = data.avatar || ''
    form.theme = data.theme || 'light'
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setSaving(value: boolean) {
    saving.value = value
  }

  return {
    profile,
    loading,
    saving,
    form,
    setProfile,
    setLoading,
    setSaving,
  }
}
