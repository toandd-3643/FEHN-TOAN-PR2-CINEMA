<template>
  <div class="contact-page">
    <div class="container">
      <div class="contact-header">
        <h1>Liên hệ hỗ trợ</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại thông tin và chúng tôi sẽ phản hồi sớm nhất.</p>
      </div>

      <div class="contact-content">
        <div class="contact-info">
          <h2>Thông tin liên hệ</h2>
          <div class="info-item">
            <Icon name="mdi:phone" />
            <div>
              <strong>Hotline</strong>
              <span>{{ contactInfo.phone }}</span>
            </div>
          </div>
          <div class="info-item">
            <Icon name="mdi:email" />
            <div>
              <strong>Email</strong>
              <span>{{ contactInfo.email }}</span>
            </div>
          </div>
          <div class="info-item">
            <Icon name="mdi:clock" />
            <div>
              <strong>Giờ làm việc</strong>
              <span>{{ contactInfo.workingHours }}</span>
            </div>
          </div>
          <div class="info-item">
            <Icon name="mdi:map-marker" />
            <div>
              <strong>Địa chỉ</strong>
              <span>{{ contactInfo.address }}</span>
            </div>
          </div>
        </div>

        <div class="contact-form">
          <form @submit.prevent="submitContact">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Họ tên <span class="required">*</span></label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Nhập họ tên của bạn"
                  required
                />
              </div>
              <div class="form-group">
                <label for="email">Email <span class="required">*</span></label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Số điện thoại</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="0123 456 789"
                />
              </div>
              <div class="form-group">
                <label for="type">Loại yêu cầu <span class="required">*</span></label>
                <select id="type" v-model="form.type" required>
                  <option value="SUPPORT">Hỗ trợ kỹ thuật</option>
                  <option value="FEEDBACK">Góp ý</option>
                  <option value="COMPLAINT">Khiếu nại</option>
                  <option value="SUGGESTION">Đề xuất</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="subject">Tiêu đề <span class="required">*</span></label>
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                placeholder="Tóm tắt vấn đề cần hỗ trợ"
                required
              />
            </div>

            <div class="form-group">
              <label for="message">Nội dung chi tiết <span class="required">*</span></label>
              <textarea
                id="message"
                v-model="form.message"
                rows="6"
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <Icon v-if="isSubmitting" name="mdi:loading" class="spin" />
              <Icon v-else name="mdi:send" />
              {{ isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu' }}
            </button>

            <div v-if="successMessage" class="alert alert-success">
              <Icon name="mdi:check-circle" />
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="alert alert-error">
              <Icon name="mdi:alert-circle" />
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseApiError } from '~/utils/error-parser'

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9+\-\s()]{10,15}$/
  return phoneRegex.test(phone)
}

const contactInfo = {
  phone: import.meta.env.VITE_CONTACT_PHONE || '0911577985',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'thuymaitoanki@gmail.com',
  workingHours: import.meta.env.VITE_CONTACT_WORKING_HOURS || '8:00 - 22:00 (Hàng ngày)',
  address: import.meta.env.VITE_CONTACT_ADDRESS || 'Trại Cá, Trương Định, Hai Bà Trưng, Hà Nội'
}

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  type: 'SUPPORT' | 'FEEDBACK' | 'COMPLAINT' | 'SUGGESTION'
}

const form = reactive<ContactForm>({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  type: 'SUPPORT'
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const validateBasicFields = (): boolean => {
  if (!form.name.trim()) {
    errorMessage.value = 'Họ tên không được để trống'
    return false
  }
  if (!form.email.trim()) {
    errorMessage.value = 'Email không được để trống'
    return false
  }
  if (!isValidEmail(form.email)) {
    errorMessage.value = 'Email không hợp lệ'
    return false
  }

  if (form.phone && !isValidPhone(form.phone)) {
    errorMessage.value = 'Số điện thoại không hợp lệ'
    return false
  }

  if (!form.subject.trim()) {
    errorMessage.value = 'Tiêu đề không được để trống'
    return false
  }
  if (!form.message.trim()) {
    errorMessage.value = 'Nội dung không được để trống'
    return false
  }
  return true
}

const submitContact = async (): Promise<void> => {
  if (!validateBasicFields()) return
  
  isSubmitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone?.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
        type: form.type
      }
    })

    if (response.success) {
      successMessage.value = response.message
      
      Object.assign(form, {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'SUPPORT'
      })
    }
  } catch (error: unknown) {
    errorMessage.value = parseApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

// SEO
useSeoMeta({
  title: 'Liên hệ hỗ trợ - MovieBooking',
  description: 'Liên hệ với đội ngũ hỗ trợ MovieBooking để được giúp đỡ về đặt vé xem phim và các dịch vụ khác.'
})

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.contact-header {
  text-align: center;
  margin-bottom: 4rem;
}

.contact-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.contact-header p {
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
}

/* Contact Info */
.contact-info {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.contact-info h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item svg {
  color: #667eea;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.info-item div {
  display: flex;
  flex-direction: column;
}

.info-item strong {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.info-item span {
  color: #6b7280;
}

/* Contact Form */
.contact-form {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-weight: 500;
}

.alert-success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #d1fae5;
}

.alert-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .contact-form {
    padding: 1.5rem;
  }

  .contact-header h1 {
    font-size: 2rem;
  }
}
</style>
