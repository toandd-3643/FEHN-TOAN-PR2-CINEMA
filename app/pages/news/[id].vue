<template>
  <section class="news-detail-page">
    <div class="container">
      <NuxtLink class="back-link" to="/news">
        <Icon name="mdi:arrow-left" /> Danh sách bài viết
      </NuxtLink>

      <div v-if="pending" class="loading">
        <Icon name="mdi:loading" class="spin" /> Đang tải bài viết...
      </div>

      <div v-else-if="error" class="error">
        <Icon name="mdi:alert-circle" /> {{ error.statusMessage || 'Không tìm thấy bài viết' }}
      </div>

      <article v-else-if="news" class="news-content">
        <h1 class="news-title">{{ news.title }}</h1>
        <div class="news-meta">
          <span class="author">{{ news.author }}</span> •
          <time :datetime="news.createdAt">{{ formatDate(news.createdAt) }}</time>
        </div>
        <img v-if="news.image" :src="news.image" :alt="news.title" class="news-image" />
        <div class="content" v-html="news.content"></div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
const route = useRoute()
const isValidId = computed(() => {
  const id = route.params.id
  return id !== undefined && id !== null && !isNaN(Number(id)) && Number.isInteger(Number(id)) && Number(id) > 0
})
let data, pending, error
if (isValidId.value) {
  ({ data, pending, error } = await useFetch(`/api/news/${route.params.id}`))
} else {
  data = ref(null)
  pending = ref(false)
  error = ref('ID bài viết không hợp lệ.')
}

const news = computed(() => data.value?.data)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.news-detail-page {
  padding: 3rem 0;
  min-height: 80vh;
  background: #f9fafb;
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #6366f1;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-decoration: none;
}
.back-link svg {
  margin-right: 0.5rem;
}

.loading,
.error {
  color: #6b7280;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 3rem;
}

.news-content {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1);
}

.news-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #3730a3;
}

.news-meta {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 2rem;
  font-weight: 500;
}

.news-image {
  max-width: 100%;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.15);
  object-fit: cover;
}

.content {
  color: #374151;
  line-height: 1.75;
  font-size: 1.1rem;
}

.content p {
  margin-bottom: 1rem;
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
