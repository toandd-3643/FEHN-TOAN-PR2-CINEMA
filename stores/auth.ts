// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCookie } from '#app'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // ✅ Helper function để get toast instance
  const getToast = () => {
    try {
      return useToast()
    } catch (error) {
      console.warn('Toast not available:', error)
      return null
    }
  }

  // ✅ Login function với toast
  const login = async (credentials) => {
    loading.value = true
    const toast = getToast()
    
    try {
      const { data } = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      user.value = data.user
      
      const authCookie = useCookie('auth-token', {
        maxAge: credentials.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
      })
      authCookie.value = data.token
      
      // ✅ Toast thành công khi đăng nhập
      if (toast) {
        toast.success(`🎉 Chào mừng ${data.user.fullName}!`, {
          title: 'Đăng nhập thành công',
          duration: 4000
        })
      }
      
      return data
    } catch (error) {
      // ✅ Toast lỗi khi đăng nhập thất bại
      if (toast) {
        const message = error.data?.message || 'Email hoặc mật khẩu không đúng'
        toast.error(message, {
          title: 'Đăng nhập thất bại',
          duration: 6000
        })
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // ✅ Register function với toast
  const register = async (userData) => {
    loading.value = true
    const toast = getToast()
    
    try {
      const { data } = await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData
      })
      
      // ✅ Toast thành công khi đăng ký
      if (toast) {
        toast.success('🎊 Tài khoản đã được tạo thành công!', {
          title: 'Đăng ký thành công',
          duration: 5000
        })
      }
      
      return data
    } catch (error) {
      // ✅ Toast lỗi khi đăng ký thất bại
      if (toast) {
        let message = 'Đăng ký thất bại, vui lòng thử lại'
        
        if (error.status === 409) {
          message = 'Email này đã được sử dụng'
        } else if (error.data?.message) {
          message = error.data.message
        }
        
        toast.error(message, {
          title: 'Đăng ký thất bại',
          duration: 6000
        })
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  // ✅ Logout function với toast
  const logout = async () => {
    loading.value = true
    const toast = getToast()
    const userName = user.value?.fullName || 'Bạn'
    
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout API error:', error)
      // Không hiển thị error toast cho logout API fail
      // vì chúng ta vẫn clear local state
    } finally {
      // Clear user state
      user.value = null
      loading.value = false
      
      // Clear auth cookie
      const authCookie = useCookie('auth-token')
      authCookie.value = null
      
      // ✅ Toast thành công khi đăng xuất
      if (toast) {
        toast.info(`👋 Tạm biệt ${userName}!`, {
          title: 'Đăng xuất thành công',
          duration: 3000
        })
      }
    }
  }

  // ✅ Fetch user function (không cần toast)
  const fetchUser = async () => {
    try {
      const { data } = await $fetch('/api/auth/me')
      user.value = data.user
      return data.user
    } catch (error) {
      const authCookie = useCookie('auth-token')
      authCookie.value = null
      throw error
    }
  }

  return {
    user,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    fetchUser
  }
})
