import { ref, reactive } from 'vue'
import type { RegisterForm } from '../../interface/register.interface'

export function useRegisterState() {
  const form = reactive<RegisterForm>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  function resetForm() {
    form.fullName = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
    error.value = null
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  function setError(message: string | null) {
    error.value = message
  }

  return {
    form,
    loading,
    error,
    resetForm,
    setLoading,
    setError,
  }
}
