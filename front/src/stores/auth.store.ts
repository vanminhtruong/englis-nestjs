import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  fullName: string
  avatar?: string
  totalScore: number
  totalWords: number
  theme?: string
  vocabularyLayout?: 'grid' | 'list'
  categoriesLayout?: 'grid' | 'list'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(userData: User, authToken: string) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    } else {
      // If user is null, set it directly (for initial load)
      user.value = userData as User
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    updateUser,
  }
})
