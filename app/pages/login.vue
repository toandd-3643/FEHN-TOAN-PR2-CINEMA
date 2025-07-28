<template>
  <div>
    <!-- ✅ Success message nếu có -->
    <div v-if="successMessage" class="success-banner">
      <Icon name="mdi:check-circle" />
      <span>{{ successMessage }}</span>
    </div>
    
    <AuthLoginForm />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

// ✅ Hiển thị success message từ query
const route = useRoute()
const successMessage = ref('')

onMounted(() => {
  if (route.query.message === 'register_success') {
    successMessage.value = 'Đăng ký thành công! Vui lòng đăng nhập vào tài khoản của bạn.'
    
    // Tự động ẩn message sau 5 giây
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  }
})

useSeoMeta({
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản MovieBooking để đặt vé xem phim online.'
})
</script>

<style scoped>
.success-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  color: #065f46;
  margin-bottom: 1rem;
  animation: fadeInDown 0.3s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
