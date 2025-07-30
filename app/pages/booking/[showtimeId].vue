<template>
  <div class="booking-page">
    <div v-if="!isReady" class="loading-container">
      <Icon name="mdi:loading" class="spin" size="48" />
      <p>Đang kiểm tra quyền truy cập...</p>
    </div>

    <div v-else-if="!isAuthenticated" class="auth-error-container">
      <Icon name="mdi:lock" size="64" />
      <h2>Vui lòng đăng nhập</h2>
      <p>Bạn cần đăng nhập để đặt vé xem phim</p>
      <div class="auth-actions">
        <NuxtLink :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`" class="btn btn-primary">
          <Icon name="mdi:login" />
          Đăng nhập
        </NuxtLink>
        <NuxtLink to="/register" class="btn btn-outline">
          <Icon name="mdi:account-plus" />
          Đăng ký
        </NuxtLink>
      </div>
    </div>

    <div v-else class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <NuxtLink to="/movies">Phim</NuxtLink>
        <Icon name="mdi:chevron-right" />
        <span>Đặt vé</span>
      </nav>

      <div class="booking-steps">
        <div :class="['step', { active: currentStep === 1 }]">
          <div class="step-number">1</div>
          <span>Chọn ghế</span>
        </div>
        <div :class="['step', { active: currentStep === 2 }]">
          <div class="step-number">2</div>
          <span>Thanh toán</span>
        </div>
        <div :class="['step', { active: currentStep === 3 }]">
          <div class="step-number">3</div>
          <span>Hoàn thành</span>
        </div>
      </div>

      <SeatSelection
        v-if="currentStep === 1"
        :showtime-id="route.params.showtimeId"
        @booking-created="handleBookingCreated"
      />

      <BookingConfirm
        v-else-if="currentStep === 2"
        :booking-data="bookingData"
        @back="currentStep = 1"
        @payment-confirmed="handlePaymentConfirmed"
      />

      <BookingSuccess
        v-else-if="currentStep === 3"
        :booking-data="confirmedBooking"
      />
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isReady = ref(false)
const currentStep = ref(1)
const bookingData = ref({})
const confirmedBooking = ref({})

const isAuthenticated = computed(() => {
  return isReady.value && authStore.isLoggedIn
})

onMounted(() => {
  setTimeout(() => {
    isReady.value = true
    
    if (!authStore.isLoggedIn) {
      console.log('User not authenticated, will show login prompt')
    }
  }, 100)
})

watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isReady.value && !isLoggedIn) {
    const returnUrl = encodeURIComponent(route.fullPath)
    router.push(`/login?redirect=${returnUrl}`)
  }
})

const handleBookingCreated = (data) => {
  bookingData.value = data
  currentStep.value = 2
}

const handlePaymentConfirmed = (data) => {
  confirmedBooking.value = data
  currentStep.value = 3
}

useSeoMeta({
  title: 'Đặt vé xem phim - MovieBooking',
  description: 'Đặt vé xem phim online nhanh chóng và tiện lợi'
})

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.booking-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.loading-container,
.auth-error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  gap: 1.5rem;
  padding: 2rem;
}

.auth-error-container {
  background: white;
  margin: 2rem auto;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.auth-error-container svg {
  color: #f59e0b;
}

.auth-error-container h2 {
  color: #1f2937;
  margin: 0;
}

.auth-error-container p {
  color: #6b7280;
  margin: 0;
}

.auth-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  color: #6b7280;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.booking-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.step.active {
  color: #667eea;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #667eea;
  color: white;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover {
  border-color: #6b7280;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .booking-steps {
    gap: 1rem;
  }
  
  .step span {
    display: none;
  }
  
  .auth-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
