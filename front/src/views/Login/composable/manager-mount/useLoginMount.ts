import { onMounted } from 'vue'
import { useAuthStore } from '../../../../stores/auth.store'
import { useRouter } from 'vue-router'
import type { LoginForm } from '../../interface/login.interface'

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
    }
  })
}
