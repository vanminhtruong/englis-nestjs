import { useRouter } from 'vue-router'
import { registerService } from '../../service/register.service'
import type { RegisterForm } from '../../interface/register.interface'
import { useAuthValidation } from '../../../../composables/useAuthValidation'
import { useToast } from '../../../../composables/useToast'

export function useRegisterHandle(
  form: RegisterForm,
  setLoading: (state: boolean) => void,
  setError: (message: string | null) => void
) {
  const router = useRouter()
  const { validateRegister } = useAuthValidation()
  const toast = useToast()

  async function handleRegister() {
    setError(null)

    if (!validateRegister(form)) {
      return
    }

    setLoading(true)
    const result = await registerService.register(form.email, form.password, form.fullName)
    setLoading(false)

    if (result.success) {
      toast.showSuccess('Registration successful! Please login.')
      router.push('/login')
    } else {
      const errorMessage = result.error || 'Registration failed'
      toast.showError(errorMessage)
    }
  }

  return {
    handleRegister,
  }
}
