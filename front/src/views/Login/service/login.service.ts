import apiService from '../../../services/api.service'
import { useAuthStore } from '../../../stores/auth.store'
import { websocketService } from '../../../services/websocket.service'

export class LoginService {
  private authStore = useAuthStore()

  async login(email: string, password: string, rememberMe: boolean = false) {
    try {
      const response = await apiService.auth.login({ email, password, rememberMe })
      const { user, token } = response.data

      this.authStore.setAuth(user, token)
      websocketService.connect()

      return { success: true, user }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      }
    }
  }

  async logout() {
    this.authStore.clearAuth()
    websocketService.disconnect()
  }
}

export const loginService = new LoginService()
