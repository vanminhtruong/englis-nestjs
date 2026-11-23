import { onMounted } from 'vue'
import { useAuthStore } from '../../../../stores/auth.store'
import { useRouter } from 'vue-router'
import type { LoginForm } from '../../interface/login.interface'
import { loadRememberedPassword } from '../../../../utils/credentialVault'

// Pre-fill the password from the browser's own password manager (never from app storage).
async function fillPasswordFromBrowser(form: LoginForm) {
  try {
    const saved = await loadRememberedPassword(form.email)
    if (saved) {
      if (!form.password) form.password = saved
      return
    }
    if (!navigator.credentials?.get || !(window as any).PasswordCredential) return
    const cred: any = await navigator.credentials.get({
      password: true,
      mediation: 'optional',
    } as any)
    if (cred && cred.type === 'password' && cred.id === form.email && !form.password) {
      form.password = cred.password
    }
  } catch {
    // Unsupported or dismissed: native autofill (autocomplete attributes) still applies.
  }
}

export function useLoginMount(form: LoginForm) {
  const authStore = useAuthStore()
  const router = useRouter()

  onMounted(() => {
    // If already logged in, redirect to vocabulary
    if (authStore.isAuthenticated) {
      router.push('/vocabulary')
      return;
    }

    // Check for remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      form.email = rememberedEmail
      form.rememberMe = true
      void fillPasswordFromBrowser(form)
    }
  })
}
