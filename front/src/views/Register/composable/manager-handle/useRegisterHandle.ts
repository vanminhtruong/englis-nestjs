import { useRouter } from 'vue-router'
import { registerService } from '../../service/register.service'
import type { RegisterForm } from '../../interface/register.interface'

export function useRegisterHandle(
  form: RegisterForm,
  setLoading: (state: boolean) => void,
  setError: (message: string | null) => void
) {
  const router = useRouter()

  async function handleRegister() {
    setError(null)
    
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const result = await registerService.register(form.email, form.password, form.fullName)
    setLoading(false)

    if (result.success) {
      router.push('/login')
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  return {
    handleRegister,
  }
}
