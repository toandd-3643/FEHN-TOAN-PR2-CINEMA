<template>
  <div class="movie-detail-page">
    <div v-if="pending" class="loading-section">
      <Icon name="mdi:loading" class="spin" size="48" />
      <span>Đang tải thông tin phim...</span>
    </div>

    <div v-else-if="error" class="error-section">
      <Icon name="mdi:alert-circle" size="48" />
      <h2>Không thể tải thông tin phim</h2>
      <p>{{ error.statusMessage || 'Đã xảy ra lỗi khi tải dữ liệu' }}</p>
      <div class="error-actions">
        <button @click="refresh()" class="btn btn-primary">
          <Icon name="mdi:refresh" />
          Thử lại
        </button>
        <NuxtLink to="/admin/movies" class="btn btn-outline">
          <Icon name="mdi:arrow-left" />
          Quay về danh sách
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="movie" class="movie-content">
      <!-- Header -->
      <div class="page-header">
        <div class="breadcrumb">
          <NuxtLink to="/admin" class="breadcrumb-item">Admin</NuxtLink>
          <Icon name="mdi:chevron-right" />
          <NuxtLink to="/admin/movies" class="breadcrumb-item">Quản lý phim</NuxtLink>
          <Icon name="mdi:chevron-right" />
          <span class="breadcrumb-current">{{ movie.title }}</span>
        </div>

        <div class="header-actions">
          <NuxtLink :to="`/admin/movies/${movie.id}/edit`" class="btn btn-primary">
            <Icon name="mdi:pencil" />
            Chỉnh sửa
          </NuxtLink>
          <button @click="deleteMovie" class="btn btn-danger">
            <Icon name="mdi:delete" />
            Xóa phim
          </button>
        </div>
      </div>

      <!-- Movie Info Grid -->
      <div class="movie-grid">
        <!-- Left Column: Poster & Actions -->
        <div class="movie-poster-section">
          <div class="poster-container">
            <img :src="movie.poster" :alt="movie.title" class="movie-poster" />
            <div class="poster-overlay">
              <div class="movie-rating" v-if="movie.rating">
                <Icon name="mdi:star" />
                <span>{{ movie.rating }}/10</span>
              </div>
            </div>
          </div>

          <div class="quick-actions">
            <button class="action-btn" @click="toggleStatus">
              <Icon :name="getStatusIcon(movie.status)" />
              <span>{{ getStatusLabel(movie.status) }}</span>
            </button>
            
            <NuxtLink :to="`/admin/showtimes?movieId=${movie.id}`" class="action-btn">
              <Icon name="mdi:calendar-clock" />
              <span>Quản lý lịch chiếu ({{ movie.showtimes.length }})</span>
            </NuxtLink>

            <button class="action-btn" v-if="movie.trailer" @click="showTrailer = true">
              <Icon name="mdi:play" />
              <span>Xem trailer</span>
            </button>
          </div>

          <!-- Statistics Cards -->
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-number">{{ movie.showtimes.length }}</div>
              <div class="stat-label">Lịch chiếu</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ movie.reviews.length }}</div>
              <div class="stat-label">Đánh giá</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ totalBookings }}</div>
              <div class="stat-label">Vé đã bán</div>
            </div>
          </div>
        </div>

        <!-- Right Column: Details -->
        <div class="movie-details-section">
          <!-- Basic Info -->
          <div class="info-section">
            <h1 class="movie-title">{{ movie.title }}</h1>
            
            <div class="movie-meta">
              <div class="meta-row">
                <span class="meta-label">Trạng thái:</span>
                <span class="status-badge" :class="movie.status.toLowerCase()">
                  {{ getStatusLabel(movie.status) }}
                </span>
              </div>
              
              <div class="meta-row">
                <span class="meta-label">Thể loại:</span>
                <span class="meta-value">{{ movie.genre }}</span>
              </div>
              
              <div class="meta-row">
                <span class="meta-label">Thời lượng:</span>
                <span class="meta-value">{{ movie.duration }} phút</span>
              </div>
              
              <div class="meta-row">
                <span class="meta-label">Ngày phát hành:</span>
                <span class="meta-value">{{ formatDate(movie.releaseDate) }}</span>
              </div>
              
              <div class="meta-row">
                <span class="meta-label">Đạo diễn:</span>
                <span class="meta-value">{{ movie.director }}</span>
              </div>
              
              <div class="meta-row">
                <span class="meta-label">Ngày tạo:</span>
                <span class="meta-value">{{ formatDate(movie.createdAt) }}</span>
              </div>
            </div>

            <div class="description-section">
              <h3>Mô tả</h3>
              <p class="movie-description">{{ movie.description }}</p>
            </div>

            <div class="cast-section">
              <h3>Diễn viên</h3>
              <p class="movie-cast">{{ movie.cast }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Showtimes Section -->
      <div class="section-card" v-if="movie.showtimes.length > 0">
        <div class="section-header">
          <h2>
            <Icon name="mdi:calendar-clock" />
            Lịch chiếu ({{ movie.showtimes.length }})
          </h2>
          <NuxtLink :to="`/admin/showtimes/create?movieId=${movie.id}`" class="btn btn-sm btn-primary">
            <Icon name="mdi:plus" />
            Thêm lịch chiếu
          </NuxtLink>
        </div>

        <div class="showtimes-grid">
          <div 
            v-for="showtime in movie.showtimes.slice(0, 6)" 
            :key="showtime.id" 
            class="showtime-card"
          >
            <div class="showtime-header">
              <h4>{{ showtime.screen.cinema.name }}</h4>
              <span class="screen-name">{{ showtime.screen.name }}</span>
            </div>
            
            <div class="showtime-details">
              <div class="showtime-time">
                <Icon name="mdi:clock" />
                <span>{{ formatTime(showtime.startTime) }}</span>
              </div>
              <div class="showtime-date">
                <Icon name="mdi:calendar" />
                <span>{{ formatDate(showtime.startTime) }}</span>
              </div>
              <div class="showtime-price">
                <Icon name="mdi:currency-usd" />
                <span>{{ formatCurrency(showtime.price) }}</span>
              </div>
            </div>

            <div class="showtime-actions">
              <NuxtLink :to="`/admin/showtimes/${showtime.id}`" class="btn btn-xs btn-outline">
                <Icon name="mdi:eye" />
              </NuxtLink>
              <NuxtLink :to="`/admin/showtimes/${showtime.id}/edit`" class="btn btn-xs btn-outline">
                <Icon name="mdi:pencil" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-if="movie.showtimes.length > 6" class="show-more">
          <NuxtLink :to="`/admin/showtimes?movieId=${movie.id}`" class="btn btn-outline">
            Xem tất cả {{ movie.showtimes.length }} lịch chiếu
            <Icon name="mdi:arrow-right" />
          </NuxtLink>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="section-card" v-if="movie.reviews.length > 0">
        <div class="section-header">
          <h2>
            <Icon name="mdi:star" />
            Đánh giá từ khán giả ({{ movie.reviews.length }})
          </h2>
          <div class="reviews-summary">
            <span class="avg-rating">{{ avgRating }}/5</span>
            <div class="rating-stars">
              <Icon 
                v-for="i in 5" 
                :key="i" 
                name="mdi:star" 
                :class="{ active: i <= Math.round(avgRating) }"
              />
            </div>
          </div>
        </div>

        <div class="reviews-list">
          <div 
            v-for="review in movie.reviews.slice(0, 5)" 
            :key="review.id" 
            class="review-item"
          >
            <div class="review-header">
              <div class="reviewer-info">
                <img 
                  :src="review.user.avatar || '/default-avatar.png'" 
                  :alt="review.user.fullName" 
                  class="reviewer-avatar"
                />
                <div class="reviewer-details">
                  <h4 class="reviewer-name">{{ review.user.fullName }}</h4>
                  <div class="review-rating">
                    <Icon 
                      v-for="i in 5" 
                      :key="i" 
                      name="mdi:star" 
                      :class="{ active: i <= review.rating }"
                    />
                    <span class="rating-number">{{ review.rating }}/5</span>
                  </div>
                </div>
              </div>
              
              <div class="review-date">
                {{ formatDate(review.createdAt) }}
              </div>
            </div>
            
            <div class="review-content" v-if="review.comment">
              <p>{{ review.comment }}</p>
            </div>
          </div>
        </div>

        <div v-if="movie.reviews.length > 5" class="show-more">
          <button class="btn btn-outline" @click="showAllReviews = !showAllReviews">
            {{ showAllReviews ? 'Thu gọn' : `Xem thêm ${movie.reviews.length - 5} đánh giá` }}
            <Icon :name="showAllReviews ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
          </button>
        </div>
      </div>

      <!-- Empty States -->
      <div v-if="movie.showtimes.length === 0" class="section-card empty-state">
        <Icon name="mdi:calendar-remove" size="48" />
        <h3>Chưa có lịch chiếu</h3>
        <p>Phim này chưa có lịch chiếu nào</p>
        <NuxtLink :to="`/admin/showtimes/create?movieId=${movie.id}`" class="btn btn-primary">
          <Icon name="mdi:plus" />
          Tạo lịch chiếu đầu tiên
        </NuxtLink>
      </div>

      <div v-if="movie.reviews.length === 0" class="section-card empty-state">
        <Icon name="mdi:star-off" size="48" />
        <h3>Chưa có đánh giá</h3>
        <p>Phim này chưa có đánh giá nào từ khán giả</p>
      </div>
    </div>

    <!-- Trailer Modal -->
    <div v-if="showTrailer && movie?.trailer" class="modal-overlay" @click="showTrailer = false">
      <div class="trailer-modal" @click.stop>
        <div class="modal-header">
          <h3>Trailer - {{ movie.title }}</h3>
          <button @click="showTrailer = false" class="close-btn">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="modal-content">
          <iframe 
            :src="getYouTubeEmbedUrl(movie.trailer)"
            frameborder="0"
            allowfullscreen
            class="trailer-iframe"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Xác nhận xóa phim</h3>
          <button @click="showDeleteModal = false" class="close-btn">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="modal-content">
          <p>Bạn có chắc chắn muốn xóa phim <strong>"{{ movie?.title }}"</strong>?</p>
          <p class="warning-text">
            <Icon name="mdi:alert" />
            Hành động này không thể hoàn tác. Tất cả lịch chiếu và đánh giá liên quan sẽ bị xóa.
          </p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="btn btn-outline">Hủy</button>
            <button @click="confirmDelete" class="btn btn-danger" :disabled="isDeleting">
              <Icon v-if="isDeleting" name="mdi:loading" class="spin" />
              <Icon v-else name="mdi:delete" />
              {{ isDeleting ? 'Đang xóa...' : 'Xóa phim' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Movie, Showtime, Review, User, Screen, Cinema } from '@prisma/client'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

// Types
interface MovieWithRelations extends Movie {
  showtimes: (Showtime & {
    screen: Screen & {
      cinema: Cinema
    }
  })[]
  reviews: (Review & {
    user: Pick<User, 'fullName' | 'avatar'>
  })[]
}

// Data fetching
const route = useRoute()
const movieId = Number(route.params.id)

const { data, pending, error, refresh } = await useFetch<{
  success: boolean
  data: MovieWithRelations
}>(`/api/admin/movies/${movieId}`)

const movie = computed(() => data.value?.data)

// Reactive data
const showTrailer = ref(false)
const showDeleteModal = ref(false)
const showAllReviews = ref(false)
const isDeleting = ref(false)

// Computed values
const totalBookings = computed(() => {
  // This would need to be calculated from bookings data
  // For now, returning a placeholder
  return movie.value?.showtimes.reduce((total, showtime) => total + 0, 0) || 0
})

const avgRating = computed(() => {
  if (!movie.value?.reviews.length) return 0
  const sum = movie.value.reviews.reduce((total, review) => total + review.rating, 0)
  return (sum / movie.value.reviews.length).toFixed(1)
})

// Methods
const getStatusLabel = (status: string) => {
  const labels = {
    COMING_SOON: 'Sắp chiếu',
    NOW_SHOWING: 'Đang chiếu',
    ENDED: 'Đã kết thúc'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusIcon = (status: string) => {
  const icons = {
    COMING_SOON: 'mdi:clock-outline',
    NOW_SHOWING: 'mdi:play-circle',
    ENDED: 'mdi:stop-circle'
  }
  return icons[status as keyof typeof icons] || 'mdi:help-circle'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getYouTubeEmbedUrl = (url: string) => {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url
}

const toggleStatus = async () => {
  if (!movie.value) return
  
  const statusFlow = {
    COMING_SOON: 'NOW_SHOWING',
    NOW_SHOWING: 'ENDED',
    ENDED: 'COMING_SOON'
  }
  
  const newStatus = statusFlow[movie.value.status as keyof typeof statusFlow]
  
  try {
    await $fetch(`/api/admin/movies/${movieId}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    
    await refresh()
  } catch (error: any) {
    alert(error.data?.statusMessage || 'Không thể cập nhật trạng thái')
  }
}

const deleteMovie = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!movie.value) return
  
  isDeleting.value = true
  
  try {
    await $fetch(`/api/admin/movies/${movieId}`, {
      method: 'DELETE'
    })
    
    await navigateTo('/admin/movies')
  } catch (error: any) {
    alert(error.data?.statusMessage || 'Không thể xóa phim')
    isDeleting.value = false
  }
}

// SEO
useSeoMeta({
  title: computed(() => `${movie.value?.title || 'Chi tiết phim'} - Admin`),
  robots: 'noindex, nofollow'
})
</script>

<style scoped>
.movie-detail-page {
  max-width: 1400px;
}

.loading-section, .error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.error-section h2 {
  color: #1e293b;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: #3498db;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-item:hover {
  color: #2980b9;
}

.breadcrumb-current {
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.movie-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.movie-poster-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.poster-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.movie-poster {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
}

.poster-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.movie-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.8);
  color: #f59e0b;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: #3498db;
  color: #3498db;
  background: #f8fafc;
}

.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.stat-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.movie-details-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.movie-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
}

.movie-meta {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.meta-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: center;
}

.meta-label {
  font-weight: 600;
  color: #64748b;
}

.meta-value {
  color: #1e293b;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
}

.status-badge.coming_soon {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.now_showing {
  background: #dcfce7;
  color: #166534;
}

.status-badge.ended {
  background: #f3f4f6;
  color: #6b7280;
}

.description-section, .cast-section {
  margin-bottom: 2rem;
}

.description-section h3, .cast-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.movie-description, .movie-cast {
  line-height: 1.7;
  color: #374151;
  margin: 0;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avg-rating {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f59e0b;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
}

.rating-stars svg {
  color: #e5e7eb;
  transition: color 0.2s ease;
}

.rating-stars svg.active {
  color: #f59e0b;
}

.showtimes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.showtime-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  transition: border-color 0.2s ease;
}

.showtime-card:hover {
  border-color: #3498db;
}

.showtime-header {
  margin-bottom: 1rem;
}

.showtime-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.screen-name {
  color: #64748b;
  font-size: 0.875rem;
}

.showtime-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.showtime-time, .showtime-date, .showtime-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.showtime-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  gap: 0.75rem;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.review-rating svg {
  color: #e5e7eb;
}

.review-rating svg.active {
  color: #f59e0b;
}

.rating-number {
  font-size: 0.875rem;
  color: #64748b;
  margin-left: 0.25rem;
}

.review-date {
  font-size: 0.875rem;
  color: #64748b;
}

.review-content p {
  line-height: 1.6;
  color: #374151;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state h3 {
  color: #1e293b;
  margin: 1rem 0 0.5rem 0;
}

.show-more {
  text-align: center;
  margin-top: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.trailer-modal {
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
}

.delete-modal {
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #374151;
}

.modal-content {
  padding: 1.5rem;
}

.trailer-iframe {
  width: 100%;
  height: 450px;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-outline {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
  color: #374151;
  border-color: #cbd5e1;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-xs {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .movie-grid {
    grid-template-columns: 1fr;
  }
  
  .movie-poster-section {
    grid-row: 2;
  }
  
  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .movie-title {
    font-size: 2rem;
  }
  
  .meta-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .showtimes-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .trailer-modal {
    width: 95vw;
    margin: 1rem;
  }
  
  .trailer-iframe {
    height: 250px;
  }
}
</style>
