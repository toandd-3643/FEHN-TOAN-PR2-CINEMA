<template>
  <section class="profile-page">
    <div class="profile-box" v-if="!pending">
      <img
        v-if="form.avatar"
        :src="form.avatar"
        alt="Avatar"
        class="avatar"
      />
      <div class="avatar-uploader">
        <input type="file" accept="image/*" @change="onAvatarChange" />
      </div>
      <form @submit.prevent="updateProfile">
        <div class="form-field">
          <label for="email">Email (không chỉnh sửa)</label>
          <input type="email" :value="form.email" id="email" disabled />
        </div>
        <div class="form-field">
          <label for="name">Họ tên</label>
          <input type="text" v-model="form.fullName" id="name" required />
        </div>
        <div class="form-field">
          <label for="phone">Số điện thoại</label>
          <input type="text" v-model="form.phone" id="phone" maxlength="20" />
        </div>
        <button class="btn btn-primary" :disabled="saving">
          <Icon v-if="saving" name="mdi:loading" class="spin" />
          <span v-else>Cập nhật thông tin</span>
        </button>
        <span v-if="success" class="success-message">Cập nhật thành công!</span>
        <span v-if="errorMsg" class="error-message">{{ errorMsg }}</span>
      </form>
    </div>
    <div v-else class="loading"><Icon name="mdi:loading" class="spin" /> Đang tải...</div>
  </section>
</template>

<script setup lang="ts">
interface User {
  id: number
  email: string
  fullName: string
  phone?: string
  avatar?: string
}

interface ApiResponse {
  success: boolean
  data: User
}

interface ProfileForm {
  email: string
  fullName: string
  phone: string
  avatar: string
}

const { data, pending, refresh } = await useFetch<ApiResponse>('/api/users/me')
const user = computed(() => data.value?.data)

const form = reactive<ProfileForm>({
  email: '',
  fullName: '',
  phone: '',
  avatar: ''
})

watchEffect(() => {
  if (user.value) {
    form.email = user.value.email || ''
    form.fullName = user.value.fullName || ''
    form.phone = user.value.phone || ''
    form.avatar = user.value.avatar || ''
  }
})

const saving = ref(false)
const success = ref(false)
const errorMsg = ref('')

const validateForm = (): boolean => {
  errorMsg.value = ''
  
  if (!form.fullName?.trim()) {
    errorMsg.value = 'Họ tên không được để trống'
    return false
  }
  
  if (form.fullName.trim().length < 2) {
    errorMsg.value = 'Họ tên phải có ít nhất 2 ký tự'
    return false
  }
  
  if (form.phone && !/^[0-9+\-\s()]{10,15}$/.test(form.phone.trim())) {
    errorMsg.value = 'Số điện thoại không hợp lệ'
    return false
  }
  
  return true
}

const updateProfile = async (): Promise<void> => {
  if (!validateForm()) return
  
  saving.value = true
  errorMsg.value = ''
  
  try {
    await $fetch('/api/users/me', {
      method: 'PUT',
      body: { 
        fullName: form.fullName.trim(), 
        phone: form.phone?.trim() || null, 
        avatar: form.avatar || null 
      }
    })
    
    success.value = true
    setTimeout(() => (success.value = false), 2000)
    await refresh()
    
  } catch (error: unknown) {
    console.error('Profile update error:', error)
    
    if (error && typeof error === 'object' && 'data' in error) {
      const apiError = error as { data?: { statusMessage?: string } }
      errorMsg.value = apiError.data?.statusMessage || 'Cập nhật thất bại!'
    } else if (error instanceof Error) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = 'Có lỗi xảy ra khi cập nhật thông tin'
    }
  } finally {
    saving.value = false
  }
}

const onAvatarChange = (e: Event): void => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errorMsg.value = 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)'
    target.value = ''
    return
  }
  
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    errorMsg.value = 'File ảnh không được vượt quá 5MB'
    target.value = ''
    return
  }
  
  const reader = new FileReader()
  reader.onload = (event: ProgressEvent<FileReader>) => {
    if (event.target?.result) {
      form.avatar = event.target.result as string
    }
  }
  reader.onerror = () => {
    errorMsg.value = 'Không thể đọc file ảnh'
  }
  reader.readAsDataURL(file)
}

onUnmounted(() => {
  success.value = false
})
</script>


<style scoped>
.profile-page {
  min-height: 60vh;
  display: flex; align-items: center; justify-content: center;
  background: #f6f7fb;
  padding: 3rem 0;
}
.profile-box {
  background: #fff;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px #8881;
  width: 100%;
  max-width: 440px;
  display: flex; flex-direction: column; align-items: center;
}
.avatar {
  width: 88px; height: 88px; border-radius: 50%; object-fit: cover;
  margin-bottom: 1rem; border: 2px solid #818cf8;
}
.avatar-uploader {
  margin-bottom: 1.5rem;
}
.avatar-uploader input[type="file"] {
  margin: 0;
}
form {
  width: 100%;
  display: flex; flex-direction: column; gap: 1.1rem;
}
.form-field label {
  display: block;
  color: #6366f1;
  margin-bottom: .4rem;
  font-weight: 500;
}
.form-field input {
  width: 100%; padding: 0.5rem 0.8rem; border-radius: 8px; border: 1px solid #c7d2fe; font-size: 1rem;
  background: #f4f5fb;
}
.btn {
  margin-top: 12px;
  padding: 0.7rem 1.6rem;
  border: none; border-radius: 8px;
  background: linear-gradient(120deg, #6366f1 0%, #818cf8 100%);
  color: #fff; font-weight: bold; cursor: pointer;
  transition: box-shadow .18s;
}
.btn[disabled] { opacity: 0.7; cursor: not-allowed; }
.success-message {
  color: #059669; margin-top: 8px; font-size: 0.95rem;
}
.error-message {
  color: #ef4444; margin-top: 8px; font-size: 0.95rem;
}
.loading { color: #6366f1; text-align: center; font-size: 1.1rem; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
</style>
