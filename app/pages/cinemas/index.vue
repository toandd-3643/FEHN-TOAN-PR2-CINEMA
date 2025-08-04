<template>
  <section class="cinema-list-hero">
    <div class="container">
      <h1>Rạp chiếu phim</h1>
      <p>Khám phá các hệ thống rạp chiếu phim trên toàn quốc</p>
      <div class="cinema-list">
        <NuxtLink v-for="cinema in cinemas" :key="cinema.id" :to="`/cinemas/${cinema.id}`" class="cinema-card">
          <div class="card-header">
            <div class="avatar">
              <Icon name="mdi:movie-open" size="32" />
            </div>
            <h3>{{ cinema.name }}</h3>
          </div>
          <div class="card-content">
            <div class="address">
              <Icon name="mdi:map-marker" /> {{ cinema.address }}
            </div>
            <div class="city">
              <Icon name="mdi:domain" /> {{ cinema.city }}
            </div>
            <div class="phone">
              <Icon name="mdi:phone" /> {{ cinema.phone }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
}
const { data } = await useFetch < { data: Cinema[] } > ('/api/cinemas')
const cinemas = computed < Cinema[] > (() => data.value?.data || [])
</script>

<style scoped>
.cinema-list-hero {
  background: linear-gradient(120deg, #ede9fe 0%, #c7d2fe 100%);
  min-height: 100vh;
  padding: 3rem 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
h1 {
  font-size: 2.2rem;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 0.7rem;
}
.cinema-list-hero p {
  color: #555;
  margin-bottom: 2.5rem;
}
.cinema-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.cinema-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(79, 70, 229, 0.07);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 1px solid #e0e7ff;
}
.cinema-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 12px 36px #a5b4fc55;
  border-color: #6366f1;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  background: linear-gradient(135deg, #6366f1, #a5b4fc);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px #a5b4fc55;
}

h3 {
  font-size: 1.2rem;
  font-weight: bold;
}
.card-content {
  color: #555;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.card-content svg {
  color: #818cf8;
  margin-right: 5px;
}

.address,
.city,
.phone {
  display: flex;
  align-items: center;
}

@media (max-width: 600px) {
  .cinema-list {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
