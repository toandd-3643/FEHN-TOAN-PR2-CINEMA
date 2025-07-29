<template>
  <div class="register-form">
    <div class="form-header">
      <h2 class="form-title">Đăng ký tài khoản</h2>
      <p class="form-subtitle">Tạo tài khoản để trải nghiệm dịch vụ</p>
    </div>

    <form @submit.prevent="handleRegister" class="auth-form" novalidate>
      <div class="form-group">
        <label for="fullName" class="form-label">
          <Icon name="mdi:account-outline" />
          Họ và tên
        </label>
        <input
          id="fullName"
          v-model="form.fullName"
          type="text"
          name="fullName"
          class="form-control"
          :class="{ 'error': errors.fullName }"
          placeholder="Nhập họ và tên"
          required
          :disabled="authStore.loading"
          autocomplete="name"
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
          name="email"
          class="form-control"
          :class="{ 'error': errors.email }"
          placeholder="Nhập email của bạn"
          required
          :disabled="authStore.loading"
          autocomplete="email"
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
          name="phone"
          class="form-control"
          :class="{ 'error': errors.phone }"
          placeholder="Nhập số điện thoại"
          :disabled="authStore.loading"
          autocomplete="tel"
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
            name="password"
            class="form-control"
            :class="{ 'error': errors.password }"
            placeholder="Nhập mật khẩu"
            required
            :disabled="authStore.loading"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
            :disabled="authStore.loading"
            tabindex="-1"
            :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
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
            name="confirmPassword"
            class="form-control"
            :class="{ 'error': errors.confirmPassword }"
            placeholder="Nhập lại mật khẩu"
            required
            :disabled="authStore.loading"
            autocomplete="new-password"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showConfirmPassword = !showConfirmPassword"
            :disabled="authStore.loading"
            tabindex="-1"
            :aria-label="showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'"
          >
            <Icon :name="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'" />
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <!-- ✅ Checkbox với error styling cải tiến -->
      <div class="form-group">
        <label class="checkbox-wrapper" :class="{ 'error': errors.acceptTerms }">
          <input 
            id="acceptTerms"
            v-model="form.acceptTerms" 
            type="checkbox" 
            name="acceptTerms"
            required 
            :disabled="authStore.loading"
            @change="handleCheckboxChange"
          />
          <span class="checkmark" :class="{ 'error': errors.acceptTerms }"></span>
          Tôi đồng ý với
          <NuxtLink to="/terms" target="_blank" class="terms-link" @click.stop>
            Điều khoản sử dụng
          </NuxtLink>
          và
          <NuxtLink to="/privacy" target="_blank" class="terms-link" @click.stop>
            Chính sách bảo mật
          </NuxtLink>
        </label>
        <!-- ✅ Error message nổi bật cho checkbox -->
        <span v-if="errors.acceptTerms" class="error-message checkbox-error">
          <Icon name="mdi:alert-circle" size="16" />
          {{ errors.acceptTerms }}
        </span>
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
  // Reset tất cả errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  
  let isValid = true
  
  // Validate tên
  if (!form.fullName.trim()) {
    errors.fullName = 'Họ và tên là bắt buộc'
    isValid = false
  }
  
  // Validate email
  if (!form.email) {
    errors.email = 'Email là bắt buộc'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email không hợp lệ'
    isValid = false
  }
  
  // Validate phone (optional)
  if (form.phone && !/^[0-9]{10,11}$/.test(form.phone.replace(/\s+/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ'
    isValid = false
  }
  
  // Validate password
  if (!form.password) {
    errors.password = 'Mật khẩu là bắt buộc'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    isValid = false
  }
  
  // Validate confirm password
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    isValid = false
  }
  
  // ✅ VALIDATE CHECKBOX - QUAN TRỌNG
  if (!form.acceptTerms) {
    errors.acceptTerms = 'Bạn phải đồng ý với điều khoản sử dụng và chính sách bảo mật'
    isValid = false
  }
  
  return isValid
}

// ✅ Function scroll đến error đầu tiên
const scrollToFirstError = () => {
  nextTick(() => {
    const firstError = document.querySelector('.form-control.error, .checkbox-wrapper.error')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Focus vào input nếu có thể
      const input = firstError.querySelector('input')
      if (input && input.type !== 'checkbox') {
        input.focus()
      }
    }
  })
}

// ✅ Handle checkbox change để clear error real-time
const handleCheckboxChange = () => {
  if (form.acceptTerms && errors.acceptTerms) {
    errors.acceptTerms = ''
  }
}

// ✅ Watch acceptTerms để clear error khi user tick
watch(() => form.acceptTerms, (newValue) => {
  if (newValue && errors.acceptTerms) {
    errors.acceptTerms = ''
  }
})

const handleRegister = async () => {
  if (!validateForm()) {
    scrollToFirstError()
    return
  }
  
  try {
    // ✅ Auth store sẽ handle toast thành công
    await authStore.register({
      fullName: form.fullName.trim(),
      email: form.email,
      phone: form.phone || undefined,
      password: form.password
    })
    
    // ✅ Redirect đến login page với message
    await router.push('/login?message=register_success')
  } catch (error: any) {
    // ✅ Chỉ handle form-specific errors
    if (error.status === 409) {
      errors.email = 'Email này đã được sử dụng'
    } else if (error.status === 400) {
      // Handle validation errors từ server
      if (error.data?.errors) {
        Object.keys(error.data.errors).forEach(key => {
          if (errors[key] !== undefined) {
            errors[key] = error.data.errors[key][0] // First error message
          }
        })
      }
    }
    // Toast error đã được handle trong store
  }
}
</script>

<style scoped>
/* Base form styles */
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

/* Password input styles */
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

/* Error message styles */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

/* ✅ Checkbox styles với error state */
.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.checkbox-wrapper.error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
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
  margin-top: 2px; /* Align với text */
}

.checkmark.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark.error {
  background-color: #10b981;
  border-color: #10b981;
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

/* ✅ Error message cho checkbox */
.checkbox-error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* ✅ Terms links styling */
.terms-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  margin: 0 0.25rem;
}

.terms-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* ✅ Prevent label click when clicking links */
.checkbox-wrapper .terms-link {
  pointer-events: auto;
}

.switch-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.switch-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

/* Button styles */
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

/* ✅ Loading animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ✅ Focus styling */
.checkbox-wrapper:focus-within {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Focus visible improvements */
.form-control:focus-visible,
.btn:focus-visible,
.password-toggle:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .register-form {
    padding: 2rem 1.5rem;
  }
  
  .form-title {
    font-size: 1.75rem;
  }
  
  .checkbox-wrapper {
    font-size: 0.85rem;
    align-items: flex-start;
  }
  
  .checkbox-error {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .register-form {
    padding: 1.5rem 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .checkbox-wrapper {
    padding: 0.4rem;
  }
}
</style>
