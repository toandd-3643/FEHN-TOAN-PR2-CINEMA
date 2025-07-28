<template>
  <div class="register-form">
    <div class="form-header">
      <h2 class="form-title">Đăng ký tài khoản</h2>
      <p class="form-subtitle">Tạo tài khoản để trải nghiệm dịch vụ</p>
    </div>

    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="fullName" class="form-label">
          <Icon name="mdi:account-outline" />
          Họ và tên
        </label>
        <input
          id="fullName"
          v-model="form.fullName"
          type="text"
          class="form-control"
          :class="{ 'error': errors.fullName }"
          placeholder="Nhập họ và tên"
          required
          :disabled="authStore.loading"
        />
        <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
      </div>

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
        <label for="phone" class="form-label">
          <Icon name="mdi:phone-outline" />
          Số điện thoại
        </label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="form-control"
          :class="{ 'error': errors.phone }"
          placeholder="Nhập số điện thoại"
          :disabled="authStore.loading"
        />
        <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
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

      <div class="form-group">
        <label for="confirmPassword" class="form-label">
          <Icon name="mdi:lock-check-outline" />
          Xác nhận mật khẩu
        </label>
        <div class="password-input">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'error': errors.confirmPassword }"
            placeholder="Nhập lại mật khẩu"
            required
            :disabled="authStore.loading"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showConfirmPassword = !showConfirmPassword"
            :disabled="authStore.loading"
          >
            <Icon :name="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'" />
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <div class="form-group">
        <label class="checkbox-wrapper">
          <input 
            v-model="form.acceptTerms" 
            type="checkbox" 
            required 
            :disabled="authStore.loading"
          />
          <span class="checkmark"></span>
          Tôi đồng ý với
          <NuxtLink to="" target="_blank" class="terms-link">Điều khoản sử dụng</NuxtLink>
          và
          <NuxtLink to="" target="_blank" class="terms-link">Chính sách bảo mật</NuxtLink>
        </label>
        <span v-if="errors.acceptTerms" class="error-message">{{ errors.acceptTerms }}</span>
      </div>

      <button
        type="submit"
        class="btn btn-primary btn-full"
        :disabled="authStore.loading"
      >
        <Icon v-if="authStore.loading" name="mdi:loading" class="spin" />
        {{ authStore.loading ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
      </button>
    </form>

    <div class="form-footer">
      <p>
        Đã có tài khoản?
        <NuxtLink to="/login" class="switch-link">Đăng nhập ngay</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const validateForm = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  let isValid = true
  
  if (!form.fullName.trim()) {
    errors.fullName = 'Họ và tên là bắt buộc'
    isValid = false
  }
  
  if (!form.email) {
    errors.email = 'Email là bắt buộc'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email không hợp lệ'
    isValid = false
  }
  
  if (form.phone && !/^[0-9]{10,11}$/.test(form.phone.replace(/\s+/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = 'Mật khẩu là bắt buộc'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    isValid = false
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    isValid = false
  }
  
  if (!form.acceptTerms) {
    errors.acceptTerms = 'Bạn phải đồng ý với điều khoản sử dụng'
    isValid = false
  }
  
  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  try {
    await authStore.register({
      fullName: form.fullName.trim(),
      email: form.email,
      phone: form.phone || undefined,
      password: form.password
    })
    
    await router.push('/login?message=register_success')
  } catch (error: any) {
    if (error.status === 409) {
      errors.email = 'Email này đã được sử dụng'
    }
  }
}
</script>

<style scoped>
/* Sử dụng các styles tương tự LoginForm */
.register-form {
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
  flex-shrink: 0;
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

.terms-link,
.switch-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.terms-link:hover,
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
  .register-form {
    padding: 2rem 1.5rem;
  }
  
  .form-title {
    font-size: 1.75rem;
  }
  
  .checkbox-wrapper {
    align-items: flex-start;
  }
}
</style>
