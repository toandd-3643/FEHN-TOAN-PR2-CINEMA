export interface User {
  id: number
  email: string
  fullName: string
  phone?: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  fullName: string
  email: string
  phone?: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}
