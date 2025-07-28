<template>
  <div class="login-form">
    <div class="form-header">
      <h2 class="form-title">Đăng nhập</h2>
      <p class="form-subtitle">Chào mừng bạn quay trở lại!</p>
    </div>

    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <label for="email" class="form-label">
          <Icon name="mdi:email-outline" />
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-control"
          :class="{ 'error': errors.email }"
          placeholder="Nhập email của bạn"
          required
          :disabled="authStore.loading"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">
          <Icon name="mdi:lock-outline" />
          Mật khẩu
        </label>
        <div class="password-input">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'error': errors.password }"
            placeholder="Nhập mật khẩu"
            required
            :disabled="authStore.loading"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
            :disabled="authStore.loading"
          >
            <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
          </button>
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <div class="form-options">
        <label class="checkbox-wrapper">
          <input 
            v-model="form.rememberMe" 
            type="checkbox" 
            :disabled="authStore.loading"
          />
          <span class="checkmark"></span>
          Ghi nhớ đăng nhập
        </label>
        <NuxtLink to="/forgot-password" class="forgot-link">
          Quên mật khẩu?
        </NuxtLink>
      </div>

      <button
        type="submit"
        class="btn btn-primary btn-full"
        :disabled="authStore.loading"
      >
        <Icon v-if="authStore.loading" name="mdi:loading" class="spin" />
        {{ authStore.loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>
    </form>

    <div class="form-footer">
      <p>
        Chưa có tài khoản?
        <NuxtLink to="/register" class="switch-link">Đăng ký ngay</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  if (!form.email) {
    errors.email = 'Email là bắt buộc'
    return false
  }
  
  if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email không hợp lệ'
    return false
  }
  
  if (!form.password) {
    errors.password = 'Mật khẩu là bắt buộc'
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    return false
  }
  
  return true
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe
    })
    
    const redirect = router.currentRoute.value.query.redirect as string || '/'
    await router.push(redirect)
  } catch (error: any) {
    if (error.status === 401) {
      errors.email = 'Email hoặc mật khẩu không đúng'
    } else {
      errors.email = 'Có lỗi xảy ra, vui lòng thử lại'
    }
  }
}
</script>

<style scoped>
.login-form {
  padding: 2.5rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-control:disabled {
  background-color: #f9fafb;
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-input .form-control {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #374151;
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-link,
.switch-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover,
.switch-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-full {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

.form-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .login-form {
    padding: 2rem 1.5rem;
  }
  
  .form-title {
    font-size: 1.75rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
