interface User {
  id: number
  email: string
  fullName: string
  role: 'USER' | 'ADMIN'
}

export const useAuthUser = () => {
  return useState<User | null>('auth.user', () => null)
}

export const useAuth = () => {
  const user = useAuthUser()

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const { data } = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      user.value = data.user
      await navigateTo('/admin')
      
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
      user.value = null
      await navigateTo('/login')
    }
  }

  const fetchUser = async () => {
    try {
      const { data } = await $fetch('/api/users/me')
      user.value = data
      return data
    } catch (error) {
      user.value = null
      throw error
    }
  }

  return {
    user: readonly(user),
    login,
    logout,
    fetchUser
  }
}
