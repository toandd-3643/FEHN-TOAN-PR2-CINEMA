<template>
  <section class="news-list-page">
    <div class="container">
      <h1>Danh sách bài viết</h1>

      <div v-if="pending" class="loading">
        <Icon name="mdi:loading" class="spin" size="32" />
        Đang tải bài viết...
      </div>

      <div v-else-if="error" class="error">
        <Icon name="mdi:alert-circle" /> Lỗi khi tải bài viết
      </div>

      <div v-else-if="newsList.length === 0" class="empty">
        <Icon name="mdi:file-document-outline" size="48" />
        Không có bài viết nào
      </div>

      <div v-else class="news-list">
        <NuxtLink
          v-for="news in newsList"
          :key="news.id"
          :to="`/news/${news.id}`"
          class="news-card"
        >
          <img v-if="news.image" :src="news.image" alt="Ảnh bài viết" class="news-image" />
          <div class="news-content">
            <h2 class="news-title">{{ news.title }}</h2>
            <p class="news-excerpt">{{ getExcerpt(news.content) }}</p>
            <div class="news-meta">
              <span class="author">{{ news.author }}</span> | 
              <time :datetime="news.createdAt">{{ formatDate(news.createdAt) }}</time>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const { data, pending, error } = await useFetch('/api/news')
const newsList = computed(() => data.value?.data || [])

const getExcerpt = (content) => {
  if (!content) return ''
  const text = content.replace(/(<([^>]+)>)/gi, "")
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.news-list-page {
  padding: 3rem 0;
  min-height: 100vh;
  background: #f9fafb;
}
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1rem;
}
h1 {
  color: #4f46e5;
  font-weight: 700;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
}
.loading, .error, .empty {
  text-align: center;
  color: #6b7280;
  margin-top: 4rem;
  font-size: 1.1rem;
}
.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(280px,1fr));
  gap: 1.5rem;
}
.news-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgb(79 70 229 / 0.15);
  color: #1e293b;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  transition: box-shadow 0.3s ease;
  overflow: hidden;
}
.news-card:hover {
  box-shadow: 0 10px 30px rgb(99 102 241 / 0.25);
}
.news-image {
  width: 100%;
  object-fit: cover;
  height: 160px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.news-content {
  padding: 1rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.news-title {
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.25;
}
.news-excerpt {
  font-size: 0.95rem;
  color: #4b5563;
  flex-grow: 1;
  overflow: hidden;
}
.news-meta {
  font-size: 0.85rem;
  color: #6b7280;
}
.news-meta .author {
  font-weight: 600;
}
</style>
