<template>
  <div class="admin-movies-page">
    <div class="page-header">
      <div class="header-left">
        <h1>Quản lý phim</h1>
        <p>Quản lý tất cả phim trong hệ thống</p>
      </div>
      <div class="header-right">
        <NuxtLink to="/admin/movies/create" class="btn btn-primary">
          <Icon name="mdi:plus" />
          Thêm phim mới
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters">
        <div class="filter-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm phim..."
            class="search-input"
            @input="debouncedSearch"
          />
        </div>
        <div class="filter-group">
          <select v-model="statusFilter" @change="loadMovies" class="status-select">
            <option value="">Tất cả trạng thái</option>
            <option value="COMING_SOON">Sắp chiếu</option>
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="ENDED">Đã kết thúc</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Movies Table -->
    <div class="table-section">
      <div v-if="isLoading" class="loading">
        <Icon name="mdi:loading" class="spin" size="32" />
        <span>Đang tải...</span>
      </div>

      <div v-else-if="movies.length === 0" class="empty-state">
        <Icon name="mdi:movie-off" size="48" />
        <h3>Chưa có phim nào</h3>
        <p>Bấm "Thêm phim mới" để thêm phim đầu tiên</p>
      </div>

      <div v-else class="table-container">
        <table class="movies-table">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Tên phim</th>
              <th>Thể loại</th>
              <th>Đạo diễn</th>
              <th>Thời lượng</th>
              <th>Trạng thái</th>
              <th>Ngày phát hành</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movie in movies" :key="movie.id">
              <td>
                <img :src="movie.poster" :alt="movie.title" class="movie-poster" />
              </td>
              <td class="movie-title">
                <div class="title-content">
                  <h4>{{ movie.title }}</h4>
                  <div class="movie-rating" v-if="movie.rating">
                    <Icon name="mdi:star" />
                    <span>{{ movie.rating }}/10</span>
                  </div>
                </div>
              </td>
              <td>{{ movie.genre }}</td>
              <td>{{ movie.director }}</td>
              <td>{{ movie.duration }} phút</td>
              <td>
                <span class="status-badge" :class="movie.status.toLowerCase()">
                  {{ getStatusLabel(movie.status) }}
                </span>
              </td>
              <td>{{ formatDate(movie.releaseDate) }}</td>
              <td class="actions">
                <div class="action-buttons">
                  <NuxtLink :to="`/admin/movies/${movie.id}`" class="btn btn-sm btn-outline" title="Xem chi tiết">
                    <Icon name="mdi:eye" />
                  </NuxtLink>
                  <NuxtLink :to="`/admin/movies/${movie.id}/edit`" class="btn btn-sm btn-outline" title="Chỉnh sửa">
                    <Icon name="mdi:pencil" />
                  </NuxtLink>
                  <button @click="deleteMovie(movie)" class="btn btn-sm btn-danger" title="Xóa phim">
                    <Icon name="mdi:delete" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage <= 1"
          class="btn btn-outline"
        >
          <Icon name="mdi:chevron-left" />
          Trước
        </button>
        
        <div class="page-numbers">
          <span v-for="page in visiblePages" :key="page">
            <button 
              v-if="typeof page === 'number'"
              @click="currentPage = page"
              :class="['page-btn', { active: page === currentPage }]"
            >
              {{ page }}
            </button>
            <span v-else class="page-ellipsis">...</span>
          </span>
        </div>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage >= totalPages"
          class="btn btn-outline"
        >
          Sau
          <Icon name="mdi:chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Movie } from '@prisma/client'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const movies = ref<Movie[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalMovies = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')
const isLoading = ref(false)

// Load movies
const loadMovies = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/admin/movies', {
      params: {
        page: currentPage.value,
        limit: 10,
        search: searchQuery.value || undefined,
        status: statusFilter.value || undefined
      }
    })
    
    if (response.success) {
      movies.value = response.data
      totalPages.value = response.pagination.totalPages
      totalMovies.value = response.pagination.total
    }
  } catch (error) {
    console.error('Load movies error:', error)
  } finally {
    isLoading.value = false
  }
}

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1
  loadMovies()
}, 500)

// Delete movie
const deleteMovie = async (movie: Movie) => {
  if (!confirm(`Bạn có chắc muốn xóa phim "${movie.title}"?\n\nLưu ý: Phim có lịch chiếu không thể xóa.`)) return
  
  try {
    await $fetch(`/api/admin/movies/${movie.id}`, { method: 'DELETE' })
    await loadMovies()
  } catch (error: any) {
    alert(error.data?.statusMessage || 'Không thể xóa phim')
  }
}

// Utility functions
const getStatusLabel = (status: string) => {
  const labels = {
    COMING_SOON: 'Sắp chiếu',
    NOW_SHOWING: 'Đang chiếu',
    ENDED: 'Đã kết thúc'
  }
  return labels[status as keyof typeof labels] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

// Computed visible pages for pagination
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 2)
    const end = Math.min(total - 1, current + 2)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    pages.push(total)
  }
  
  return pages
})

// Watch page changes
watch(currentPage, loadMovies)

// Load initial data
onMounted(loadMovies)

// SEO
useSeoMeta({
  title: 'Quản lý phim - Admin',
  robots: 'noindex, nofollow'
})
</script>

<style scoped>
.admin-movies-page {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.header-left h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.header-left p {
  color: #64748b;
  margin: 0;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  flex: 1;
}

.search-input, .status-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus, .status-select:focus {
  outline: none;
  border-color: #3498db;
}

.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
}

.table-container {
  overflow-x: auto;
}

.movies-table {
  width: 100%;
  border-collapse: collapse;
}

.movies-table th {
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e2e8f0;
}

.movies-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.movie-poster {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.title-content h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1e293b;
}

.movie-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
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

.btn-outline {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
  color: #374151;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover {
  background: #f8fafc;
  color: #374151;
}

.page-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.page-ellipsis {
  padding: 0.5rem;
  color: #64748b;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .table-container {
    overflow-x: scroll;
  }

  .movies-table {
    min-width: 800px;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
