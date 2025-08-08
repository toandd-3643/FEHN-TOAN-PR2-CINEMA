<template>
  <div class="create-movie-page">
    <div class="page-header">
      <div class="header-left">
        <NuxtLink to="/admin/movies" class="back-link">
          <Icon name="mdi:arrow-left" />
          Quay lại
        </NuxtLink>
        <div>
          <h1>Thêm phim mới</h1>
          <p>Nhập thông tin chi tiết về phim</p>
        </div>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="createMovie">
        <div class="form-grid">
          <!-- Basic Info -->
          <div class="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div class="form-group">
              <label for="title">Tên phim <span class="required">*</span></label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                placeholder="Nhập tên phim"
                :class="{ error: errors.title }"
              />
              <span v-if="errors.title" class="error-text">{{ errors.title }}</span>
            </div>

            <div class="form-group">
              <label for="description">Mô tả <span class="required">*</span></label>
              <textarea
                id="description"
                v-model="form.description"
                required
                rows="4"
                placeholder="Mô tả nội dung phim"
                :class="{ error: errors.description }"
              ></textarea>
              <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="duration">Thời lượng (phút) <span class="required">*</span></label>
                <input
                  id="duration"
                  v-model.number="form.duration"
                  type="number"
                  min="1"
                  required
                  placeholder="120"
                  :class="{ error: errors.duration }"
                />
                <span v-if="errors.duration" class="error-text">{{ errors.duration }}</span>
              </div>

              <div class="form-group">
                <label for="genre">Thể loại <span class="required">*</span></label>
                <input
                  id="genre"
                  v-model="form.genre"
                  type="text"
                  required
                  placeholder="Hành động, Phiêu lưu"
                  :class="{ error: errors.genre }"
                />
                <span v-if="errors.genre" class="error-text">{{ errors.genre }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="director">Đạo diễn <span class="required">*</span></label>
                <input
                  id="director"
                  v-model="form.director"
                  type="text"
                  required
                  placeholder="Tên đạo diễn"
                  :class="{ error: errors.director }"
                />
                <span v-if="errors.director" class="error-text">{{ errors.director }}</span>
              </div>

              <div class="form-group">
                <label for="rating">Đánh giá (0-10)</label>
                <input
                  id="rating"
                  v-model.number="form.rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="8.5"
                />
              </div>
            </div>
          </div>

          <!-- Cast & Media -->
          <div class="form-section">
            <h3>Diễn viên & Media</h3>
            
            <div class="form-group">
              <label for="cast">Diễn viên <span class="required">*</span></label>
              <textarea
                id="cast"
                v-model="form.cast"
                required
                rows="3"
                placeholder="Danh sách diễn viên chính"
                :class="{ error: errors.cast }"
              ></textarea>
              <span v-if="errors.cast" class="error-text">{{ errors.cast }}</span>
            </div>

            <div class="form-group">
              <label for="poster">URL Poster <span class="required">*</span></label>
              <input
                id="poster"
                v-model="form.poster"
                type="url"
                required
                placeholder="https://example.com/poster.jpg"
                :class="{ error: errors.poster }"
              />
              <span v-if="errors.poster" class="error-text">{{ errors.poster }}</span>
              
              <div v-if="form.poster" class="poster-preview">
                <img :src="form.poster" alt="Poster preview" @error="handleImageError" />
              </div>
            </div>

            <div class="form-group">
              <label for="trailer">URL Trailer</label>
              <input
                id="trailer"
                v-model="form.trailer"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <!-- Release Info -->
          <div class="form-section">
            <h3>Thông tin phát hành</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="releaseDate">Ngày phát hành <span class="required">*</span></label>
                <input
                  id="releaseDate"
                  v-model="form.releaseDate"
                  type="date"
                  required
                  :class="{ error: errors.releaseDate }"
                />
                <span v-if="errors.releaseDate" class="error-text">{{ errors.releaseDate }}</span>
              </div>

              <div class="form-group">
                <label for="status">Trạng thái <span class="required">*</span></label>
                <select
                  id="status"
                  v-model="form.status"
                  required
                  :class="{ error: errors.status }"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="COMING_SOON">Sắp chiếu</option>
                  <option value="NOW_SHOWING">Đang chiếu</option>
                  <option value="ENDED">Đã kết thúc</option>
                </select>
                <span v-if="errors.status" class="error-text">{{ errors.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <NuxtLink to="/admin/movies" class="btn btn-outline">
            Hủy
          </NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <Icon v-if="isSubmitting" name="mdi:loading" class="spin" />
            <Icon v-else name="mdi:check" />
            {{ isSubmitting ? 'Đang tạo...' : 'Tạo phim' }}
          </button>
        </div>

        <!-- Error/Success Messages -->
        <div v-if="successMessage" class="alert alert-success">
          <Icon name="mdi:check-circle" />
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-error">
          <Icon name="mdi:alert-circle" />
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MovieStatus } from '@prisma/client'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

interface MovieForm {
  title: string
  description: string
  duration: number | null
  genre: string
  director: string
  cast: string
  rating: number | null
  poster: string
  trailer: string
  releaseDate: string
  status: MovieStatus | ''
}

const form = reactive<MovieForm>({
  title: '',
  description: '',
  duration: null,
  genre: '',
  director: '',
  cast: '',
  rating: null,
  poster: '',
  trailer: '',
  releaseDate: '',
  status: ''
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Validation
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.title.trim()) {
    errors.value.title = 'Tên phim không được để trống'
  }
  
  if (!form.description.trim()) {
    errors.value.description = 'Mô tả không được để trống'
  }
  
  if (!form.duration || form.duration <= 0) {
    errors.value.duration = 'Thời lượng phải lớn hơn 0'
  }
  
  if (!form.genre.trim()) {
    errors.value.genre = 'Thể loại không được để trống'
  }
  
  if (!form.director.trim()) {
    errors.value.director = 'Đạo diễn không được để trống'
  }
  
  if (!form.cast.trim()) {
    errors.value.cast = 'Danh sách diễn viên không được để trống'
  }
  
  if (!form.poster.trim()) {
    errors.value.poster = 'URL poster không được để trống'
  }
  
  if (!form.releaseDate) {
    errors.value.releaseDate = 'Ngày phát hành không được để trống'
  }
  
  if (!form.status) {
    errors.value.status = 'Trạng thái không được để trống'
  }
  
  if (form.rating && (form.rating < 0 || form.rating > 10)) {
    errors.value.rating = 'Đánh giá phải từ 0-10'
  }
  
  return Object.keys(errors.value).length === 0
}

// Submit form
const createMovie = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    const response = await $fetch('/api/admin/movies', {
      method: 'POST',
      body: {
        ...form,
        rating: form.rating || undefined,
        trailer: form.trailer || undefined
      }
    })
    
    if (response.success) {
      successMessage.value = response.message
      setTimeout(() => {
        navigateTo(`/admin/movies/${response.data.id}`)
      }, 1000)
    }
  } catch (error: any) {
    errorMessage.value = error.data?.statusMessage || 'Không thể tạo phim'
  } finally {
    isSubmitting.value = false
  }
}

// Handle image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

// SEO
useSeoMeta({
  title: 'Thêm phim mới - Admin',
  robots: 'noindex, nofollow'
})
</script>

<style scoped>
.create-movie-page {
  max-width: 1000px;
}

.page-header {
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #374151;
}

.header-left h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.header-left p {
  color: #64748b;
  margin: 0;
}

.form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-grid {
  display: grid;
  gap: 2rem;
}

.form-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-section h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.form-group input.error,
.form-group textarea.error,
.form-group select.error {
  border-color: #ef4444;
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.poster-preview {
  margin-top: 1rem;
  text-align: center;
}

.poster-preview img {
  max-width: 200px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
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

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-weight: 500;
}

.alert-success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #d1fae5;
}

.alert-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header-left {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
