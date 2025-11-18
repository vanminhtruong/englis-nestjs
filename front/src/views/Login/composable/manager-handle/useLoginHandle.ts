import { useRouter } from 'vue-router'
import { loginService } from '../../service/login.service'
import type { LoginForm } from '../../interface/login.interface'

export function useLoginHandle(
  form: LoginForm,
  setLoading: (state: boolean) => void,
  setError: (message: string | null) => void
) {
  const router = useRouter()

  async function handleLogin() {
    setError(null)
    
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    const result = await loginService.login(form.email, form.password)
    setLoading(false)

    if (result.success) {
      router.push('/vocabulary')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return {
    handleLogin,
  }
}
