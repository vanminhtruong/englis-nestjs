export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginResponse {
  success: boolean
  user?: {
    id: string
    email: string
    fullName: string
    avatar?: string
    totalScore: number
    totalWords: number
  }
  error?: string
}
