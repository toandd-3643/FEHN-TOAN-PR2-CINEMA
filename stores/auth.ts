import type { User, LoginCredentials, RegisterData } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  const toast = useToast()

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    
    try {
      const { data } = await $fetch<any>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      user.value = data.user
      
      // Set auth cookie
      const authCookie = useCookie('auth-token', {
        maxAge: credentials.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        httpOnly: false,
        secure: true,
        sameSite: 'strict'
      })
      authCookie.value = data.token
      
      toast.success(`Chào mừng ${data.user.fullName}!`)
      
      return data
    } catch (error: any) {
      const message = error.data?.message || 'Đăng nhập thất bại'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    loading.value = true
    
    try {
      const { data } = await $fetch<any>('/api/auth/register', {
        method: 'POST',
        body: userData
      })
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      
      return data
    } catch (error: any) {
      const message = error.data?.message || 'Đăng ký thất bại'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
      user.value = null
      
      const authCookie = useCookie('auth-token')
      authCookie.value = null
      
      toast.info('Đã đăng xuất thành công.')
      
      await navigateTo('/login')
    }
  }

  const fetchUser = async () => {
    try {
      const { data } = await $fetch<any>('/api/auth/me')
      user.value = data.user
      return data.user
    } catch (error) {
      const authCookie = useCookie('auth-token')
      authCookie.value = null
      throw error
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    fetchUser
  }
})
