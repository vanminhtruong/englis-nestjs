import apiService from '../../../services/api.service'

export class RegisterService {
  async register(email: string, password: string, fullName: string) {
    try {
      const response = await apiService.auth.register({ email, password, fullName })
      const { user } = response.data

      return { success: true, user }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      }
    }
  }
}

export const registerService = new RegisterService()
