<template>
  <div class="home-page">
    <!-- Hero Section đơn giản -->
    <section class="hero">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">🎬 MovieBooking</h1>
          <p class="hero-subtitle">
            Đặt vé xem phim online nhanh chóng, tiện lợi
          </p>

          <div class="hero-actions">
            <!-- Hiển thị khi chưa đăng nhập -->
            <template v-if="!authStore.isLoggedIn">
              <NuxtLink to="/movies" class="btn btn-primary btn-large">
                <Icon name="mdi:movie" />
                Xem phim ngay
              </NuxtLink>
              <NuxtLink to="/register" class="btn btn-secondary btn-large">
                <Icon name="mdi:account-plus" />
                Đăng ký
              </NuxtLink>
            </template>

            <!-- Hiển thị khi đã đăng nhập -->
            <template v-else>
              <div class="user-welcome">
                <h3 class="welcome-text">
                  <Icon name="mdi:account-circle" />
                  Chào mừng, {{ authStore.user?.fullName }}!
                </h3>
                <div class="user-actions">
                  <NuxtLink to="/movies" class="btn btn-primary btn-large">
                    <Icon name="mdi:movie" />
                    Xem phim ngay
                  </NuxtLink>
                  <NuxtLink to="/profile" class="btn btn-outline-white btn-large">
                    <Icon name="mdi:account" />
                    Hồ sơ
                  </NuxtLink>
                  <button @click="handleLogout" class="btn btn-secondary btn-large" :disabled="authStore.loading">
                    <Icon v-if="authStore.loading" name="mdi:loading" class="spin" />
                    <Icon v-else name="mdi:logout" />
                    {{ authStore.loading ? 'Đang đăng xuất...' : 'Đăng xuất' }}
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Movies với Pagination -->
    <section class="featured-movies">
      <div class="container">
        <h2 class="section-title">Phim đang hot</h2>

        <!-- Loading state -->
        <div v-if="moviesPending" class="loading-state">
          <Icon name="mdi:loading" class="spin" size="48" />
          <p>Đang tải danh sách phim...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="moviesError" class="error-state">
          <Icon name="mdi:alert-circle" size="48" />
          <p>Không thể tải danh sách phim. Vui lòng thử lại sau.</p>
          <button @click="refreshMovies()" class="btn btn-outline">
            <Icon name="mdi:refresh" />
            Thử lại
          </button>
        </div>

        <!-- Movies Grid -->
        <div v-else-if="movies && movies.length > 0" class="movies-grid">
          <NuxtLink 
            v-for="movie in movies" 
            :key="movie.id" 
            :to="`/movies/${movie.id}`" 
            class="movie-card"
          >
            <div class="movie-poster">
              <img 
                v-if="movie.poster" 
                :src="movie.poster" 
                :alt="movie.title"
                @error="handleImageError"
              />
              <div v-else class="placeholder-poster">
                <Icon name="mdi:movie" size="48" />
              </div>

              <!-- Overlay with play button -->
              <div class="movie-overlay">
                <div class="play-button">
                  <Icon name="mdi:play" size="32" />
                </div>
              </div>
            </div>

            <div class="movie-info">
              <h3 class="movie-title" :title="movie.title">{{ movie.title }}</h3>
              <p class="movie-genre">{{ movie.genre }}</p>
              <div class="movie-meta">
                <div class="movie-rating" v-if="movie.rating">
                  <Icon name="mdi:star" />
                  <span>{{ movie.rating.toFixed(1) }}</span>
                </div>
                <span class="movie-duration">{{ movie.duration }} phút</span>
              </div>
              <p class="movie-director">Đạo diễn: {{ movie.director }}</p>
              <div class="movie-status" :class="`status-${movie.status.toLowerCase()}`">
                {{ getStatusText(movie.status) }}
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <Icon name="mdi:movie-off" size="64" />
          <h3>Chưa có phim nào</h3>
          <p>Hiện tại chưa có phim nào đang chiếu.</p>
        </div>

        <!-- ✅ Pagination Component -->
        <div v-if="pagination.totalPages > 1" class="pagination-wrapper">
          <nav class="pagination">
            <!-- Previous button -->
            <button 
              @click="prevPage" 
              :disabled="!pagination.hasPrevPage"
              class="pagination-btn"
              :class="{ disabled: !pagination.hasPrevPage }"
            >
              <Icon name="mdi:chevron-left" />
              Trước
            </button>

            <!-- Page numbers -->
            <div class="pagination-numbers">
              <button
                v-for="page in getVisiblePages()"
                :key="page"
                @click="goToPage(page)"
                class="pagination-number"
                :class="{ active: page === currentPage }"
              >
                {{ page }}
              </button>
            </div>

            <!-- Next button -->
            <button 
              @click="nextPage" 
              :disabled="!pagination.hasNextPage"
              class="pagination-btn"
              :class="{ disabled: !pagination.hasNextPage }"
            >
              Sau
              <Icon name="mdi:chevron-right" />
            </button>
          </nav>

          <!-- Pagination info -->
          <div class="pagination-info">
            Hiển thị {{ pagination.startIndex }} - {{ pagination.endIndex }} 
            trong tổng số {{ pagination.totalItems }} phim
          </div>
        </div>
      </div>
    </section>

    <!-- Features (giữ nguyên) -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Tại sao chọn MovieBooking?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <Icon name="mdi:clock-fast" size="40" />
            </div>
            <h3>Đặt vé nhanh chóng</h3>
            <p>Chỉ với vài click chuột, bạn đã có vé xem phim yêu thích</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <Icon name="mdi:seat" size="40" />
            </div>
            <h3>Chọn ghế tự do</h3>
            <p>Xem sơ đồ rạp và chọn ghế ngồi theo ý muốn</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <Icon name="mdi:credit-card" size="40" />
            </div>
            <h3>Thanh toán an toàn</h3>
            <p>Hỗ trợ nhiều phương thức thanh toán tiện lợi</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// ✅ Pagination state
const currentPage = ref(parseInt(route.query.page as string) || 1)
const itemsPerPage = ref(4)

// ✅ Fetch movies với pagination
const { data: moviesData, pending: moviesPending, error: moviesError, refresh: refreshMovies } = await useFetch('/api/movies/movies', {
  query: {
    page: currentPage,
    limit: itemsPerPage,
    status: 'NOW_SHOWING'
  },
  watch: [currentPage]
})

// Computed properties
const movies = computed(() => moviesData.value?.data || [])
const pagination = computed(() => moviesData.value?.pagination || {})

// ✅ Pagination methods
const goToPage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  
  currentPage.value = page
  
  // Update URL
  router.push({
    query: { ...route.query, page }
  })
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextPage = () => {
  if (pagination.value.hasNextPage) {
    goToPage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (pagination.value.hasPrevPage) {
    goToPage(currentPage.value - 1)
  }
}

// ✅ Get visible page numbers
const getVisiblePages = () => {
  const total = pagination.value.totalPages
  const current = currentPage.value
  const delta = 2
  
  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)
  
  if (end - start < delta * 2) {
    if (start === 1) {
      end = Math.min(total, start + delta * 2)
    } else {
      start = Math.max(1, end - delta * 2)
    }
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Existing methods
const handleLogout = async () => {
  try {
    await authStore.logout()
    await router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  const placeholder = event.target.parentElement.querySelector('.placeholder-poster')
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}

const getStatusText = (status) => {
  const statusMap = {
    'NOW_SHOWING': 'Đang chiếu',
    'COMING_SOON': 'Sắp chiếu',
    'ENDED': 'Đã kết thúc'
  }
  return statusMap[status] || status
}

// SEO Meta
useSeoMeta({
  title: 'Trang chủ',
  description: 'MovieBooking - Nền tảng đặt vé xem phim online hàng đầu Việt Nam.',
  ogTitle: 'MovieBooking - Đặt vé xem phim online',
  ogDescription: 'Nền tảng đặt vé xem phim online hàng đầu Việt Nam'
})

definePageMeta({
  title: 'Trang chủ - MovieBooking'
})
</script>



<style scoped>
/* Hero Section */
.hero {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -2;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

.hero-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 0;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

/* Sections */
.featured-movies,
.features {
  padding: 4rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #1f2937;
}

/* Movies Grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.movie-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.movie-poster {
  aspect-ratio: 2/3;
  position: relative;
  overflow: hidden;
}

.placeholder-poster {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.movie-info {
  padding: 1rem;
}

.movie-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
  /* ✅ Thêm CSS để truncate text */
  white-space: nowrap;
  /* Không cho xuống dòng */
  overflow: hidden;
  /* Ẩn phần text thừa */
  text-overflow: ellipsis;
  /* Hiển thị dấu ... */
  max-width: 100%;
  /* Đảm bảo không vượt quá container */
}

/* ✅ Optional: Thêm tooltip để hiển thị tên đầy đủ khi hover */
.movie-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  /* Cho tooltip */
}

.movie-genre {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.movie-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
  font-weight: 600;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

/* ✅ User Welcome Styles */
.user-welcome {
  text-align: center;
  width: 100%;
}

.welcome-text {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.user-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ✅ Additional button styles */
.btn-outline-white {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.7);
}

/* ✅ Loading animation */
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

/* ✅ Responsive cho user welcome */
@media (max-width: 768px) {
  .welcome-text {
    font-size: 1.25rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .user-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .welcome-text {
    font-size: 1.1rem;
  }

  .user-actions .btn {
    width: 100%;
    max-width: 280px;
  }
}

/* Animations */
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

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 2rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 60vh;
  }

  .hero-title {
    font-size: 2rem;
  }

  .btn-large {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}


.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-state .spin {
  color: #667eea;
  margin-bottom: 1rem;
}

.error-state {
  color: #ef4444;
}

.empty-state {
  color: #9ca3af;
}

.movie-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.play-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  transition: transform 0.2s ease;
}

.play-button:hover {
  transform: scale(1.1);
}

.movie-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.movie-duration {
  font-size: 0.8rem;
  color: #9ca3af;
}

.movie-director {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.movie-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  text-align: center;
}

.status-now_showing {
  background: #dcfce7;
  color: #166534;
}

.status-coming_soon {
  background: #fef3c7;
  color: #92400e;
}

.status-ended {
  background: #f3f4f6;
  color: #6b7280;
}

/* Responsive updates */
@media (max-width: 768px) {
  .movies-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .movie-info {
    padding: 0.75rem;
  }

  .movie-title {
    font-size: 1rem;
  }
}

.pagination-wrapper {
  margin-top: 3rem;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.pagination-btn:hover:not(.disabled) {
  background: #667eea;
  color: white;
}

.pagination-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-number {
  width: 40px;
  height: 40px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.pagination-number:hover {
  border-color: #667eea;
  color: #667eea;
}

.pagination-number.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .pagination-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
  
  .pagination-number {
    width: 36px;
    height: 36px;
  }
}

</style>
