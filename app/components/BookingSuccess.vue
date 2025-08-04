<template>
  <div class="booking-success">
    <div class="success-icon">
      <Icon name="mdi:check-circle" size="80" />
    </div>
    
    <h1>Đặt vé thành công!</h1>
    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
    
    <div class="booking-details">
      <h2>Chi tiết đặt vé</h2>
      <div class="detail-card">
        <div class="booking-code">
          <strong>Mã đặt vé: {{ bookingData.bookingCode }}</strong>
        </div>
        <div class="details-grid">
          <div class="detail-item">
            <strong>Phim:</strong>
            <span>{{ bookingData.movie }}</span>
          </div>
          <div class="detail-item">
            <strong>Rạp:</strong>
            <span>{{ bookingData.cinema }}</span>
          </div>
          <div class="detail-item">
            <strong>Suất chiếu:</strong>
            <span>{{ formatDateTime(bookingData.startTime) }}</span>
          </div>
          <div class="detail-item">
            <strong>Ghế:</strong>
            <span>{{ bookingData.seats?.join(', ') }}</span>
          </div>
          <div class="detail-item">
            <strong>Tổng tiền:</strong>
            <span class="price">{{ formatPrice(bookingData.totalPrice) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <NuxtLink to="/profile/bookings" class="btn btn-primary">
        <Icon name="mdi:history" />
        Xem lịch sử đặt vé
      </NuxtLink>
      <NuxtLink to="/" class="btn btn-secondary">
        <Icon name="mdi:movie" />
        Đặt vé phim khác
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  bookingData: {
    type: Object,
    required: true
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN')
}
</script>

<style scoped>
.booking-success {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
}

.success-icon {
  color: #10b981;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

p {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 3rem;
}

.booking-details h2 {
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.detail-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 3rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.booking-code {
  text-align: center;
  background: #667eea;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item strong {
  color: #374151;
}

.detail-item span {
  color: #1f2937;
  font-weight: 600;
}

.detail-item .price {
  color: #dc2626;
  font-weight: 700;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
