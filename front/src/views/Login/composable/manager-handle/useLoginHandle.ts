import { useRouter } from 'vue-router'
import { loginService } from '../../service/login.service'
import type { LoginForm } from '../../interface/login.interface'
import { useAuthValidation } from '../../../../composables/useAuthValidation'
import { useToast } from '../../../../composables/useToast'

export function useLoginHandle(
  form: LoginForm,
  setLoading: (state: boolean) => void,
  setError: (message: string | null) => void
) {
  const router = useRouter()
  const { validateLogin } = useAuthValidation()
  const toast = useToast()

  async function handleLogin() {
    setError(null)

    if (!validateLogin(form)) {
      return
    }

    setLoading(true)
    const result = await loginService.login(form.email, form.password)
    setLoading(false)

    if (result.success) {
      toast.showSuccess('Login successful')
      router.push('/vocabulary')
    } else {
      const errorMessage = result.error || 'Login failed'
      // setError(errorMessage) // Optional: keep validation error text if desired, but toast is requested
      toast.showError(errorMessage)
    }
  }

  return {
    handleLogin,
  }
}
