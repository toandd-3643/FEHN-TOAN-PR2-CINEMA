<template>
  <div class="home-page">
    <!-- Hero Section -->
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
            <NuxtLink to="/" class="btn btn-primary btn-large">
              <Icon name="mdi:movie" />
              Xem phim ngay
            </NuxtLink>
            <NuxtLink to="/register" class="btn btn-secondary btn-large">
              <Icon name="mdi:account-plus" />
              Đăng ký
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Movies -->
    <section class="featured-movies">
      <div class="container">
        <h2 class="section-title">Phim đang hot</h2>
        <div class="movies-grid">
          <div 
            v-for="i in 6" 
            :key="i" 
            class="movie-card"
          >
            <div class="movie-poster">
              <div class="placeholder-poster">
                <Icon name="mdi:movie" size="48" />
              </div>
            </div>
            <div class="movie-info">
              <h3 class="movie-title">Phim mẫu {{ i }}</h3>
              <p class="movie-genre">Hành động, Phiêu lưu</p>
              <div class="movie-rating">
                <Icon name="mdi:star" />
                <span>8.5</span>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center">
          <NuxtLink to="/" class="btn btn-outline">
            Xem tất cả phim
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features -->
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

<script setup>
// SEO Meta
useSeoMeta({
  title: 'Trang chủ',
  description: 'MovieBooking - Nền tảng đặt vé xem phim online hàng đầu Việt Nam. Đặt vé nhanh chóng, chọn ghế tự do, thanh toán an toàn.',
  ogTitle: 'MovieBooking - Đặt vé xem phim online',
  ogDescription: 'Nền tảng đặt vé xem phim online hàng đầu Việt Nam',
  ogImage: '/og-image.jpg'
})

// Page meta
definePageMeta({
  title: 'Trang chủ - MovieBooking'
})

// Optional: Fetch featured data
// const { data: featuredMovies } = await useFetch('/api/movies?featured=true')
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
</style>
