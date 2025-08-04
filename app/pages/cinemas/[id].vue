<template>
  <section class="cinema-detail">
    <div class="container">
      <NuxtLink class="back-link" to="/cinemas">
        <Icon name="mdi:arrow-left" /> Danh sách rạp
      </NuxtLink>
      <div v-if="pending" class="loading">
        <Icon name="mdi:loading" class="spin" /> Đang tải thông tin rạp...
      </div>
      <div v-else-if="error" class="error">
        <Icon name="mdi:alert-circle" /> Không tìm thấy rạp!
      </div>
      <div v-else>
        <div class="cinema-header">
          <div class="logo-avatar">
            <Icon name="mdi:movie-open" size="48"/>
          </div>
          <div>
            <h1>{{ cinema.name }}</h1>
            <div class="cinema-meta">
              <span><Icon name="mdi:map-marker" /> {{ cinema.address }}</span>
              <span><Icon name="mdi:city" /> {{ cinema.city }}</span>
              <span><Icon name="mdi:phone" /> {{ cinema.phone }}</span>
            </div>
          </div>
        </div>
        <div class="divider"></div>

        <h2>Phim đang chiếu</h2>
        <div v-if="cinema.movies.length" class="movie-list">
          <NuxtLink
            v-for="movie in cinema.movies"
            :key="movie.id"
            :to="`/movies/${movie.id}`"
            class="movie-card"
          >
            <img v-if="movie.poster" :src="movie.poster" :alt="movie.title"  class="movie-poster" />
            <div class="movie-title">{{ movie.title }}</div>
          </NuxtLink>
        </div>
        <div v-else class="no-movie">
          <Icon name="mdi:movie-off" size="36" />
          <span>Hiện tại chưa có suất chiếu phim nào.</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup  lang="ts">
const route = useRoute()
const { data, pending, error } = await useFetch(`/api/cinemas/${route.params.id}`)
const cinema = computed(() => data.value?.data)
</script>

<style scoped>
.cinema-detail {
  background: linear-gradient(120deg, #f1f5f9 0%, #e0e7ff 100%);
  min-height: 100vh;
  padding: 2.5rem 0 5rem 0;
}
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 2rem;
}
.back-link {
  display: inline-flex; align-items: center; color: #6366f1;
  font-weight: 500; text-decoration: none; margin-bottom: 1.6rem;
}
.back-link svg { margin-right: 5px; }

.cinema-header {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  margin-bottom: 2rem;
  background: #f3f4f6;
  border-radius: 18px;
  box-shadow: 0 2px 12px #c7d2fe7e;
  padding: 1.8rem 2rem;
}
.logo-avatar {
  width: 70px; height: 70px;
  background: linear-gradient(135deg,#6366f1,#818cf8);
  color: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem;
  box-shadow: 0 2px 8px #818cf888;
}

.cinema-header h1 {
  font-size: 1.7rem;
  font-weight: 800;
  color: #312e81;
  margin: 0 0 .6rem 0;
}
.cinema-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  color: #5b21b6;
  font-size: 1rem;
}
.cinema-meta span {
  display: flex; align-items: center;
  gap: 0.3rem;
}
.cinema-meta svg { color: #6366f1; }

.divider {
  border-bottom: 1.5px solid #c7d2fe;
  margin: 2.5rem 0 1.5rem 0;
}

h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4f46e5;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  margin-top: 1.7rem;
}
.movie-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 18px #a5b4fc22;
  color: #312e81;
  text-decoration: none;
  padding: 1.2rem;
  transition: box-shadow .18s, transform .12s;
  border: 1px solid #e0e7ff;
  text-align: center;
}

.movie-card:hover {
  box-shadow: 0 6px 30px #6366f142;
  transform: translateY(-4px) scale(1.04);
  color: #4f46e5;
  border-color: #7c3aed;
}

.movie-poster {
  width: 110px; height: 160px; object-fit: cover; border-radius: 9px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px #aecbfa55;
}
.movie-title {
  font-weight: 600; font-size: 1rem; margin-top: 0.5rem;
  color: #312e81;
}

.no-movie {
  text-align: center;
  color: #7c3aed;
  margin-top: 3rem;
  font-size: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
}

.loading, .error {
  text-align: center;
  color: #6366f1;
  margin-top: 3rem;
  font-size: 1.12rem;
}
@media (max-width: 700px) {
  .container { padding: 0 0.5rem; }
  .cinema-header { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 1rem; }
  .logo-avatar { width: 55px; height: 55px; font-size: 1.4rem; }
  .movie-list { gap: 1rem; }
  .movie-card { padding: 0.7rem; }
  .movie-poster { width: 88px; height: 120px; }
}
</style>
