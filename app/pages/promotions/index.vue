<template>
  <div class="promotions-page">
    <div class="container">
      <header class="page-header">
        <h1>Khuyến mãi đặc biệt</h1>
        <p>Khám phá các chương trình khuyến mãi hấp dẫn dành cho bạn</p>
      </header>

      <div v-if="pending" class="loading-section">
        <div class="skeleton-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card">
            <div class="skeleton skeleton-badge"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-description"></div>
            <div class="skeleton skeleton-dates"></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="error-section" role="alert">
        <Icon name="mdi:alert-circle" size="48" />
        <h2>Không thể tải khuyến mãi</h2>
        <p>{{ error.statusMessage || 'Đã xảy ra lỗi khi tải danh sách khuyến mãi' }}</p>
        <button @click="refresh()" class="btn-retry">
          <Icon name="mdi:refresh" /> Thử lại
        </button>
      </div>

      <div v-else-if="promotions.length === 0" class="empty-section">
        <Icon name="mdi:gift-outline" size="64" />
        <h2>Chưa có khuyến mãi nào</h2>
        <p>Hiện tại chưa có chương trình khuyến mãi nào đang diễn ra. Hãy quay lại sau nhé!</p>
      </div>

      <div v-else class="promotions-grid">
        <article 
          v-for="promotion in promotions" 
          :key="promotion.id" 
          class="promotion-card"
        >
          <div class="card-header">
            <div class="discount-badge">
              <Icon name="mdi:percent" />
              {{ Math.round(promotion.discount) }}%
            </div>
            <div class="promotion-code">
              <Icon name="mdi:ticket" />
              {{ promotion.code }}
            </div>
          </div>

          <div class="card-content">
            <h2 class="promotion-title">{{ promotion.title }}</h2>
            <p class="promotion-description">{{ promotion.description }}</p>
            
            <div class="promotion-meta">
              <div class="date-info">
                <Icon name="mdi:calendar-start" />
                <span>{{ formatDate(promotion.startDate) }}</span>
              </div>
              <div class="date-info">
                <Icon name="mdi:calendar-end" />
                <span>{{ formatDate(promotion.endDate) }}</span>
              </div>
            </div>

            <div class="time-remaining">
              <Icon name="mdi:clock-outline" />
              <span>{{ getTimeRemaining(promotion.endDate) }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button 
              @click="copyCode(promotion.code)" 
              class="btn-copy"
              :class="{ 'copied': copiedCode === promotion.code }"
            >
              <Icon :name="copiedCode === promotion.code ? 'mdi:check' : 'mdi:content-copy'" />
              {{ copiedCode === promotion.code ? 'Đã sao chép' : 'Sao chép mã' }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Promotion {
  id: number
  title: string
  description: string
  discount: number
  code: string
  startDate: string
  endDate: string
  active: boolean
  createdAt: string
}

const { data, pending, error, refresh } = await useFetch<{
  success: boolean
  data: Promotion[]
}>('/api/promotions', {
  server: true,
  key: 'promotions-list'
})

const promotions = computed(() => data.value?.data || [])
const copiedCode = ref('')

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getTimeRemaining = (endDate: string): string => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Đã hết hạn'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `Còn ${days} ngày ${hours} giờ`
  } else if (hours > 0) {
    return `Còn ${hours} giờ`
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `Còn ${minutes} phút`
  }
}

const copyCode = async (code: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(code)
    copiedCode.value = code
    setTimeout(() => {
      copiedCode.value = ''
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

useSeoMeta({
  title: 'Khuyến mãi đặc biệt - MovieBooking',
  description: 'Khám phá các chương trình khuyến mãi hấp dẫn khi đặt vé xem phim. Giảm giá lên đến 50% cho các suất chiếu hot.',
  ogTitle: 'Khuyến mãi đặc biệt - MovieBooking',
  ogDescription: 'Khuyến mãi giảm giá vé xem phim lên đến 50%. Áp dụng ngay để tiết kiệm!',
})

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.promotions-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.page-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.loading-section {
  margin-top: 2rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

.skeleton-badge {
  height: 2rem;
  width: 80px;
  align-self: flex-start;
}

.skeleton-title {
  height: 1.5rem;
  width: 70%;
}

.skeleton-description {
  height: 3rem;
  width: 100%;
}

.skeleton-dates {
  height: 1rem;
  width: 60%;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.error-section, .empty-section {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 3rem;
  color: #6b7280;
}

.error-section h2, .empty-section h2 {
  margin: 1rem 0 0.5rem 0;
  color: #1f2937;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-retry:hover {
  background: #5a67d8;
}

.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.promotion-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.promotion-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.discount-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.promotion-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.card-content {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.promotion-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.promotion-description {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.promotion-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.9rem;
}

.date-info svg {
  color: #667eea;
}

.time-remaining {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.9rem;
  background: #fef2f2;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
}

.card-actions {
  padding: 0 2rem 2rem 2rem;
}

.btn-copy {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-copy:hover {
  background: #5a67d8;
}

.btn-copy.copied {
  background: #10b981;
}

.btn-copy.copied:hover {
  background: #059669;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .promotions-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .promotion-meta {
    flex-direction: column;
  }
}
</style>
