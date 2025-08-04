<template>
  <div class="review-item">
    <div class="review-header">
      <div class="user-info">
        <div class="user-avatar">
          <img v-if="review.user.avatar" :src="review.user.avatar" :alt="review.user.fullName" />
          <Icon v-else name="mdi:account-circle" size="40" />
        </div>
        <div class="user-details">
          <h4>{{ review.user.fullName }}</h4>
          <div class="review-rating">
            <Icon 
              v-for="i in 5" 
              :key="i"
              name="mdi:star"
              :class="{ filled: i <= review.rating }"
            />
          </div>
        </div>
      </div>
      
      <div class="review-meta">
        <time class="review-date">{{ formatDate(review.createdAt) }}</time>
        <button 
          v-if="canDelete"
          @click="deleteReview"
          class="delete-btn"
          title="Xóa đánh giá"
        >
          <Icon name="mdi:delete" />
        </button>
      </div>
    </div>

    <div v-if="review.comment" class="review-comment">
      <p>{{ review.comment }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  review: {
    type: Object,
    required: true
  },
  canDelete: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['review-deleted'])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const deleteReview = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

  try {
    await $fetch(`/api/reviews/${props.review.id}`, {
      method: 'DELETE'
    })
    
    emit('review-deleted', props.review.id)
  } catch (error) {
    alert('Không thể xóa đánh giá. Vui lòng thử lại.')
  }
}
</script>

<style scoped>
.review-item {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h4 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #1f2937;
}

.review-rating {
  display: flex;
  gap: 0.125rem;
}

.review-rating .filled {
  color: #fbbf24;
}

.review-rating .mdi:not(.filled) {
  color: #d1d5db;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.review-date {
  color: #6b7280;
  font-size: 0.9rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.delete-btn:hover {
  background: #fef2f2;
}

.review-comment p {
  margin: 0;
  line-height: 1.6;
  color: #374151;
}

@media (max-width: 640px) {
  .review-header {
    flex-direction: column;
    gap: 1rem;
  }

  .review-meta {
    align-self: flex-start;
  }
}
</style>
