import { onMounted } from 'vue'
import { useAuthStore } from '../../../../stores/auth.store'
import { useRouter } from 'vue-router'

export function useLoginMount() {
  const authStore = useAuthStore()
  const router = useRouter()

  onMounted(() => {
    // If already logged in, redirect to vocabulary
    if (authStore.isAuthenticated) {
      router.push('/vocabulary')
    }
  })
}
