<template>
  <div class="review-form">
    <h3>{{ existingReview ? 'Cập nhật đánh giá' : 'Viết đánh giá' }}</h3>
    
    <form @submit.prevent="submitReview" class="form">
      <!-- Rating stars -->
      <div class="rating-input">
        <label>Đánh giá của bạn:</label>
        <div class="stars-input">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="rating = star"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="star-button"
            :class="{ 
              active: star <= rating,
              hover: star <= hoverRating
            }"
          >
            <Icon name="mdi:star" />
          </button>
        </div>
        <span v-if="rating" class="rating-text">
          {{ getRatingText(rating) }}
        </span>
      </div>

      <!-- Comment input -->
      <div class="comment-input">
        <label for="comment">Bình luận (tùy chọn):</label>
        <textarea
          id="comment"
          v-model="comment"
          placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
          rows="4"
          maxlength="500"
          class="comment-textarea"
        ></textarea>
        <div class="character-count">
          {{ comment.length }}/500 ký tự
        </div>
      </div>

      <!-- Submit button -->
      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="!rating || isSubmitting"
          class="btn btn-primary"
        >
          <Icon v-if="isSubmitting" name="mdi:loading" class="spin" />
          <Icon v-else name="mdi:send" />
          {{ isSubmitting ? 'Đang gửi...' : (existingReview ? 'Cập nhật' : 'Gửi đánh giá') }}
        </button>
        
        <button 
          v-if="existingReview"
          type="button"
          @click="resetForm"
          class="btn btn-outline"
        >
          Hủy
        </button>
      </div>
    </form>

    <!-- Error message -->
    <div v-if="errorMessage" class="error-message">
      <Icon name="mdi:alert-circle" />
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  movieId: {
    type: Number,
    required: true
  },
  existingReview: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['review-submitted'])

// Reactive state
const rating = ref(props.existingReview?.rating || 0)
const comment = ref(props.existingReview?.comment || '')
const hoverRating = ref(0)
const isSubmitting = ref(false)
const errorMessage = ref('')

// Methods
const getRatingText = (rating) => {
  const texts = {
    1: 'Rất tệ',
    2: 'Tệ',
    3: 'Bình thường',
    4: 'Tốt',
    5: 'Rất tốt'
  }
  return texts[rating] || ''
}

const submitReview = async () => {
  if (!rating.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch(`/api/movies/${props.movieId}/reviews`, {
      method: 'POST',
      body: {
        rating: rating.value,
        comment: comment.value.trim() || null
      }
    })

    if (response.success) {
      emit('review-submitted', {
        review: response.data,
        movieRating: response.movieRating
      })
      
      const toast = useToast()
      if (toast) {
        toast.success(
          `${response.message}. Điểm phim hiện tại: ${response.movieRating.average}/5 (${response.movieRating.totalReviews} đánh giá)`,
          { duration: 5000 }
        )
      }
      
      if (!props.existingReview) {
        resetForm()
      }
    }
  } catch (error) {
    errorMessage.value = error.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  if (props.existingReview) {
    rating.value = props.existingReview.rating
    comment.value = props.existingReview.comment || ''
  } else {
    rating.value = 0
    comment.value = ''
  }
  errorMessage.value = ''
}

// Watch for prop changes
watch(() => props.existingReview, (newReview) => {
  if (newReview) {
    rating.value = newReview.rating
    comment.value = newReview.comment || ''
  }
}, { immediate: true })
</script>

<style scoped>
.review-form {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.review-form h3 {
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rating-input label,
.comment-input label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.stars-input {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.star-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #d1d5db;
  transition: color 0.2s ease;
  padding: 0.25rem;
}

.star-button.active,
.star-button.hover {
  color: #fbbf24;
}

.star-button:hover {
  transform: scale(1.1);
}

.rating-text {
  color: #6b7280;
  font-style: italic;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
}

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
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover {
  border-color: #6b7280;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
