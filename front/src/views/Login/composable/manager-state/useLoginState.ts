import { ref, reactive } from 'vue'
import type { LoginForm } from '../../interface/login.interface'

export function useLoginState() {
  const form = reactive<LoginForm>({
    email: '',
    password: '',
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  function resetForm() {
    form.email = ''
    form.password = ''
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
