import { useRouter } from 'vue-router'
import { loginService } from '../../service/login.service'
import type { LoginForm } from '../../interface/login.interface'
import { useAuthValidation } from '../../../../composables/useAuthValidation'
import { useToast } from '../../../../composables/useToast'

async function saveCredentialInBrowser(email: string, password: string) {
  try {
    const PasswordCredentialCtor = (window as any).PasswordCredential
    if (PasswordCredentialCtor && navigator.credentials?.store) {
      await navigator.credentials.store(
        new PasswordCredentialCtor({ id: email, password, name: email })
      )
    }
  } catch {
    // Unsupported browser or blocked: the browser's own save prompt still works.
  }
}

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
    const result = await loginService.login(form.email, form.password, form.rememberMe)
    setLoading(false)

    if (result.success) {
      if (form.rememberMe) {
        localStorage.setItem('rememberedEmail', form.email)
        // Hand the password to the browser's own password manager. The app itself
        // never stores the password (not in localStorage, not anywhere else).
        await saveCredentialInBrowser(form.email, form.password)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

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
