<template>
  <div class="movie-detail-page">
    <!-- Loading state -->
    <div v-if="pending" class="loading-container">
      <Icon name="mdi:loading" class="spin" size="48" />
      <p>Đang tải thông tin phim...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <Icon name="mdi:alert-circle" size="64" />
      <h2>Không thể tải thông tin phim</h2>
      <p>{{ error.statusMessage || 'Đã xảy ra lỗi khi tải dữ liệu' }}</p>
      <button @click="refresh()" class="btn btn-primary">
        <Icon name="mdi:refresh" />
        Thử lại
      </button>
    </div>

    <!-- Movie content -->
    <template v-else-if="movie">
      <!-- Hero section -->
      <section class="movie-hero">
        <div class="hero-background">
          <img v-if="movie.poster" :src="movie.poster" :alt="movie.title" />
          <div class="hero-overlay"></div>
        </div>

        <div class="container">
          <div class="movie-hero-content">
            <div class="movie-poster">
              <img v-if="movie.poster" :src="movie.poster" :alt="movie.title" />
              <div v-else class="poster-placeholder">
                <Icon name="mdi:movie" size="80" />
              </div>
            </div>

            <div class="movie-info">
              <h1 class="movie-title">{{ movie.title }}</h1>

              <div class="movie-meta">
                <div class="rating-section">
                  <div class="average-rating">
                    <Icon name="mdi:star" />
                    <span class="rating-number">{{ movie.averageRating }}</span>
                    <span class="rating-count">({{ movie.totalReviews }} đánh giá)</span>
                  </div>
                  <div class="movie-status" :class="`status-${movie.status.toLowerCase()}`">
                    {{ getStatusText(movie.status) }}
                  </div>
                </div>

                <div class="movie-details">
                  <div class="detail-item">
                    <Icon name="mdi:clock" />
                    <span>{{ movie.duration }} phút</span>
                  </div>
                  <div class="detail-item">
                    <Icon name="mdi:calendar" />
                    <span>{{ formatDate(movie.releaseDate) }}</span>
                  </div>
                  <div class="detail-item">
                    <Icon name="mdi:tag" />
                    <span>{{ movie.genre }}</span>
                  </div>
                </div>

                <div class="movie-crew">
                  <div class="crew-item">
                    <strong>Đạo diễn:</strong> {{ movie.director }}
                  </div>
                  <div class="crew-item">
                    <strong>Diễn viên:</strong> {{ movie.cast }}
                  </div>
                </div>
              </div>

              <div class="movie-actions">
                <button v-if="movie.trailer" @click="showTrailer = true" class="btn btn-primary btn-large">
                  <Icon name="mdi:play" />
                  Xem trailer
                </button>
                <button v-if="movie.showtimes && movie.showtimes.length > 0" @click="scrollToShowtimes"
                  class="btn btn-secondary btn-large">
                  <Icon name="mdi:ticket" />
                  Đặt vé
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Movie description -->
      <section class="movie-description section">
        <div class="container">
          <h2>Nội dung phim</h2>
          <p class="description-text">{{ movie.description }}</p>
        </div>
      </section>

      <!-- Showtimes -->
      <section v-if="movie.showtimes && movie.showtimes.length > 0" class="showtimes section" ref="showtimesRef">
        <div class="container">
          <h2>Lịch chiếu</h2>
          <div class="showtimes-grid">
            <div v-for="showtime in movie.showtimes" :key="showtime.id" class="showtime-card">
              <div class="cinema-info">
                <h4>{{ showtime.screen.cinema.name }}</h4>
                <p>{{ showtime.screen.cinema.address }}</p>
              </div>
              <div class="showtime-details">
                <div class="showtime-time">
                  {{ formatDateTime(showtime.startTime) }}
                </div>
                <div class="showtime-price">
                  {{ formatPrice(showtime.price) }}
                </div>
                <NuxtLink :to="`/booking/${showtime.id}`" class="btn btn-primary btn-small">
                  Chọn ghế
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reviews section -->
      <section class="reviews section">
        <div class="container">
          <div class="reviews-header">
            <h2>Đánh giá phim</h2>
            <div class="rating-summary">
              <div class="average-rating-large">
                <span class="rating-number">{{ movie.averageRating }}</span>
                <div class="stars">
                  <Icon v-for="i in 5" :key="i" name="mdi:star"
                    :class="{ filled: i <= Math.round(movie.averageRating) }" />
                </div>
                <span class="total-reviews">{{ movie.totalReviews }} đánh giá</span>
              </div>

              <div class="rating-breakdown">
                <div v-for="(count, star) in movie.ratingStats" :key="star" class="rating-bar">
                  <span class="star-label">{{ star }} sao</span>
                  <div class="bar">
                    <div class="bar-fill"
                      :style="{ width: `${movie.totalReviews > 0 ? (count / movie.totalReviews) * 100 : 0}%` }"></div>
                  </div>
                  <span class="count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Review form -->
          <MovieReviewForm 
            v-if="authStore.isLoggedIn"
            :movie-id="movie.id"
            :existing-review="userReview"
            @review-submitted="handleReviewSubmitted"
          />
          
          <div v-else class="login-prompt">
            <p>Vui lòng đăng nhập để đánh giá phim</p>
            <NuxtLink to="/login" class="btn btn-primary">Đăng nhập</NuxtLink>
          </div>

          <!-- Reviews list -->
          <div class="reviews-list">
            <MovieReviewItem v-for="review in movie.reviews" :key="review.id" :review="review"
              :can-delete="authStore.user?.id === review.user.id || authStore.isAdmin"
              @review-deleted="handleReviewDeleted" />
          </div>
        </div>
      </section>
    </template>

    <!-- Trailer modal -->
    <MovieTrailerModal v-if="showTrailer && movie?.trailer" :trailer-url="movie.trailer" @close="showTrailer = false" />
  </div>
</template>

<script setup>
import { getStatusText } from '/utils/constants'

const route = useRoute()
const authStore = useAuthStore()

// Reactive state
const showTrailer = ref(false)
const showtimesRef = ref(null)

// Fetch movie data
const { data: movieData, pending, error, refresh } = await useFetch(`/api/movies/${route.params.id}`)

const movie = computed(() => movieData.value?.data)

// User's existing review
const userReview = computed(() => {
  if (!authStore.isLoggedIn || !movie.value?.reviews) return null
  return movie.value.reviews.find(review => review.user.id === authStore.user?.id)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const scrollToShowtimes = () => {
  if (showtimesRef.value) {
    showtimesRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleReviewSubmitted = (data) => {
  if (movie.value && data.movieRating) {
    movie.value.averageRating = data.movieRating.average
    movie.value.totalReviews = data.movieRating.totalReviews
  }

  refresh() // Refresh toàn bộ data để đảm bảo consistency
}

const handleReviewDeleted = async (reviewId) => {
  try {
    const response = await $fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE'
    })

    if (response.success && movie.value) {
      // Cập nhật rating ngay lập tức
      movie.value.averageRating = response.movieRating.average
      movie.value.totalReviews = response.movieRating.totalReviews
    }
  } catch (error) {
  }

  refresh() // Refresh data
}

// SEO
useSeoMeta({
  title: computed(() => movie.value ? `${movie.value.title} - MovieBooking` : 'Chi tiết phim'),
  description: computed(() => movie.value?.description || 'Xem chi tiết phim tại MovieBooking'),
  ogTitle: computed(() => movie.value?.title),
  ogDescription: computed(() => movie.value?.description),
  ogImage: computed(() => movie.value?.poster)
})

definePageMeta({
  layout: 'default'
})

const goToBooking = (showtimeId) => {
  if (!authStore.isLoggedIn) {
    const returnUrl = encodeURIComponent(`/booking/${showtimeId}`)
    router.push(`/login?redirect=${returnUrl}`)
    return
  }
  
  router.push(`/booking/${showtimeId}`)
}
</script>

<style scoped>
.movie-detail-page {
  min-height: 100vh;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  gap: 1rem;
}

.error-container {
  color: #ef4444;
}

/* Movie Hero */
.movie-hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -2;
}

.hero-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px) brightness(0.3);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%);
  z-index: -1;
}

.movie-hero-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  align-items: start;
}

.movie-poster {
  position: relative;
}

.movie-poster img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.poster-placeholder {
  width: 100%;
  aspect-ratio: 2/3;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}

.movie-info {
  padding-top: 1rem;
}

.movie-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.movie-meta {
  margin-bottom: 2rem;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.rating-number {
  font-weight: 700;
  font-size: 1.5rem;
  color: #fbbf24;
}

.rating-count {
  color: rgba(255, 255, 255, 0.8);
}

.movie-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.movie-crew .crew-item {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.movie-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Status badges */
.movie-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-now_showing {
  background: #10b981;
}

.status-coming_soon {
  background: #f59e0b;
}

.status-ended {
  background: #6b7280;
}

/* Sections */
.section {
  padding: 4rem 0;
}

.section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1f2937;
}

.description-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4b5563;
}

/* Showtimes */
.showtimes-grid {
  display: grid;
  gap: 1.5rem;
}

.showtime-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.cinema-info h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.cinema-info p {
  color: #6b7280;
  font-size: 0.9rem;
}

.showtime-details {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.showtime-time {
  font-weight: 600;
  color: #1f2937;
}

.showtime-price {
  font-weight: 700;
  color: #dc2626;
}

/* Reviews */
.reviews-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.rating-summary {
  display: flex;
  gap: 2rem;
}

.average-rating-large {
  text-align: center;
}

.average-rating-large .rating-number {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.stars .filled {
  color: #fbbf24;
}

.stars .mdi:not(.filled) {
  color: #d1d5db;
}

.total-reviews {
  color: #6b7280;
  font-size: 0.9rem;
}

.rating-breakdown {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.star-label {
  width: 60px;
  font-size: 0.9rem;
  color: #6b7280;
}

.bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #fbbf24;
  transition: width 0.3s ease;
}

.count {
  width: 30px;
  text-align: right;
  font-size: 0.9rem;
  color: #6b7280;
}

.login-prompt {
  text-align: center;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.reviews-list {
  margin-top: 3rem;
}

/* Responsive */
@media (max-width: 768px) {
  .movie-hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .movie-title {
    font-size: 2rem;
  }

  .movie-details {
    justify-content: center;
  }

  .reviews-header {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .rating-summary {
    flex-direction: column;
    align-items: center;
  }

  .showtime-card {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
