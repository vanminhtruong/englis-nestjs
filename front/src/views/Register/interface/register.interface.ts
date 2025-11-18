export interface RegisterForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResponse {
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
