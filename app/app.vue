<template>
  <div id="app">
    <!-- Loading Screen với ClientOnly -->
    <ClientOnly>
      <Transition name="fade">
        <div v-if="pending" class="global-loading">
          <div class="loading-content">
            <div class="loading-spinner">
              <Icon name="mdi:loading" class="spin" size="48" />
            </div>
            <h3>🎬 MovieBooking</h3>
            <p>Đang tải...</p>
          </div>
        </div>
      </Transition>
    </ClientOnly>

    <!-- Main Content -->
    <div v-show="!pending" class="app-content">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <!-- Toast Component - Wrap trong ClientOnly -->
      <ClientOnly>
        <CommonToast />
      </ClientOnly>
    </div>
  </div>
</template>


<script setup>
// Sửa cách khởi tạo để tránh hydration mismatch
const pending = ref(true)

// Chỉ chạy trên client
onMounted(async () => {
  try {
    const authStore = useAuthStore()
    const token = useCookie('auth-token')
    
    if (token.value) {
      await authStore.fetchUser()
    }
  } catch (error) {
    console.warn('Auth initialization failed:', error)
  } finally {
    // Set timeout nhỏ để tránh flash
    setTimeout(() => {
      pending.value = false
    }, 100)
  }
})

// SEO
useHead({
  titleTemplate: (title) => title ? `${title} - MovieBooking` : 'MovieBooking - Đặt vé xem phim online',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#667eea' }
  ]
})

useSeoMeta({
  title: 'MovieBooking - Đặt vé xem phim online',
  description: 'Đặt vé xem phim online nhanh chóng, tiện lợi tại MovieBooking'
})
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
}

.app-content {
  min-height: 100vh;
}

/* Global Loading */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
}

.loading-content {
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.loading-content p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast Container */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  width: 100%;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .loading-content h3 {
    font-size: 1.75rem;
  }
}
</style>
