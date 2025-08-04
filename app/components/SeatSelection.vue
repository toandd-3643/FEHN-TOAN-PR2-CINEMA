<template>
  <div class="seat-selection">
    <!-- Loading state -->
    <div v-if="pending" class="loading-container">
      <Icon name="mdi:loading" class="spin" size="48" />
      <p>Đang tải sơ đồ ghế...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <Icon name="mdi:alert-circle" size="48" />
      <p>Không thể tải sơ đồ ghế</p>
      <button @click="refresh()" class="btn btn-primary">Thử lại</button>
    </div>

    <!-- Seat selection -->
    <div v-else class="seat-container">
      <!-- Movie info -->
      <div class="movie-info">
        <h2>{{ showtimeData?.movie?.title }}</h2>
        <div class="showtime-details">
          <p><Icon name="mdi:home" /> {{ showtimeData?.screen?.cinema?.name }}</p>
          <p><Icon name="mdi:clock" /> {{ formatDateTime(showtimeData?.startTime) }}</p>
        </div>
      </div>

      <!-- Screen -->
      <div class="screen">
        <Icon name="mdi:television" />
        <span>Màn hình</span>
      </div>

      <!-- Enhanced legend with better examples -->
      <div class="seat-legend">
        <div class="legend-item">
          <div class="seat-demo available"></div>
          <span>Ghế thường</span>
        </div>
        <div class="legend-item">
          <div class="seat-demo selected"></div>
          <span>Đã chọn</span>
        </div>
        <div class="legend-item">
          <div class="seat-demo booked"></div>
          <span>Đã đặt</span>
        </div>
        <div class="legend-item">
          <div class="seat-demo vip"></div>
          <span>VIP</span>
        </div>
        <div class="legend-item">
          <div class="seat-demo couple"></div>
          <span>Couple</span>
        </div>
      </div>

      <!-- Enhanced seats grid with better seat info -->
      <div class="seats-grid">
        <div v-for="(rowSeats, row) in seatsData" :key="row" class="seat-row">
          <div class="row-label">{{ row }}</div>
          <div class="row-seats">
            <button
              v-for="seat in rowSeats"
              :key="seat.id"
              @click="toggleSeat(seat)"
              :disabled="seat.isBooked || !seat.isActive"
              :class="[
                'seat',
                `seat-${seat.type.toLowerCase()}`,
                {
                  'available': !seat.isBooked && seat.isActive,
                  'booked': seat.isBooked,
                  'selected': selectedSeats.includes(seat.id)
                }
              ]"
              :title="`${row}${seat.number} - ${formatPrice(seat.price)} - ${getSeatTypeText(seat.type)}`"
            >
              {{ seat.number }}
            </button>
          </div>
        </div>
      </div>

      <!-- Selected seats info -->
      <div v-if="selectedSeats.length > 0" class="selected-info">
        <h3>Ghế đã chọn</h3>
        <div class="selected-list">
          <span v-for="seatInfo in selectedSeatsInfo" :key="seatInfo.id" class="selected-seat">
            {{ seatInfo.label }} - {{ formatPrice(seatInfo.price) }}
          </span>
        </div>
        <div class="total-price">
          <strong>Tổng tiền: {{ formatPrice(totalPrice) }}</strong>
        </div>
        <div class="booking-actions">
          <button @click="$emit('back')" class="btn btn-outline">
            <Icon name="mdi:arrow-left" />
            Quay lại
          </button>
          <button @click="proceedToBooking" :disabled="isBooking" class="btn btn-primary">
            <Icon v-if="isBooking" name="mdi:loading" class="spin" />
            <Icon v-else name="mdi:credit-card" />
            {{ isBooking ? 'Đang xử lý...' : 'Tiếp tục' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  showtimeId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['back', 'booking-created'])

// Fetch seats data
const { data: seatsResponse, pending, error, refresh } = await useFetch(`/api/showtimes/${props.showtimeId}/seats`)

const showtimeData = computed(() => seatsResponse.value?.data?.showtime)
const seatsData = computed(() => seatsResponse.value?.data?.seats || {})

// State
const selectedSeats = ref([])
const isBooking = ref(false)

// Computed
const selectedSeatsInfo = computed(() => {
  if (!seatsData.value) return []
  
  return selectedSeats.value.map(seatId => {
    for (const row in seatsData.value) {
      const seat = seatsData.value[row].find(s => s.id === seatId)
      if (seat) {
        return {
          id: seat.id,
          label: `${row}${seat.number}`,
          price: seat.price,
          type: seat.type
        }
      }
    }
  }).filter(Boolean)
})

const totalPrice = computed(() => {
  return selectedSeatsInfo.value.reduce((sum, seat) => sum + seat.price, 0)
})

// Enhanced seat type helper
const getSeatTypeText = (type) => {
  const typeMap = {
    'REGULAR': 'Ghế thường',
    'VIP': 'Ghế VIP',
    'COUPLE': 'Ghế đôi', 
    'DISABLED': 'Ghế người khuyết tật'
  }
  return typeMap[type] || type
}

// Enhanced toggle seat method với feedback
const toggleSeat = (seat) => {
  if (seat.isBooked || !seat.isActive) return
  
  const index = selectedSeats.value.indexOf(seat.id)
  
  if (index > -1) {
    selectedSeats.value.splice(index, 1)
    console.log(`Deselected seat ${seat.row}${seat.number} (${seat.type})`)
  } else {
    if (selectedSeats.value.length >= 8) {
      alert('Không thể chọn quá 8 ghế')
      return
    }
    selectedSeats.value.push(seat.id)
    console.log(`Selected seat ${seat.row}${seat.number} (${seat.type})`)
  }
}

const proceedToBooking = async () => {
  isBooking.value = true
  
  try {
    const response = await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        showtimeId: props.showtimeId,
        seatIds: selectedSeats.value
      }
    })
    
    if (response.success) {
      emit('booking-created', response.data)
    }
  } catch (error) {
    console.error('Booking error:', error)
    alert(error.data?.message || 'Có lỗi xảy ra khi đặt vé')
  } finally {
    isBooking.value = false
  }
}

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
.seat-selection {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.movie-info {
  text-align: center;
  margin-bottom: 2rem;
}

.movie-info h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
}

.showtime-details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.showtime-details p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #6b7280;
}

.screen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 50px;
  margin: 2rem auto;
  max-width: 200px;
  font-weight: 600;
}

/* Enhanced seat legend */
.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 600;
}

.seat-demo {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #d1d5db;
  position: relative;
}

.seat-demo.available {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.seat-demo.selected {
  background: #667eea;
  border-color: #667eea;
}

.seat-demo.selected::before {
  content: '✓';
  position: absolute;
  top: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: white;
  font-weight: 800;
  border: 1px solid white;
}

.seat-demo.booked {
  background: #ef4444;
  border-color: #dc2626;
}

.seat-demo.vip {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #d97706;
}

.seat-demo.couple {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  border-color: #be185d;
}

.seats-grid {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.seat-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.row-label {
  width: 30px;
  text-align: center;
  font-weight: 600;
  color: #374151;
}

.row-seats {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

/* Enhanced seat styling với proper priority */
.seat {
  width: 32px;
  height: 32px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Base seat states */
.seat.available:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.seat.booked {
  background: #ef4444;
  border-color: #dc2626;
  color: white;
  cursor: not-allowed;
}

.seat.booked:hover {
  transform: none;
}

/* VIP seat styling - base state */
.seat.seat-vip.available {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-color: #d97706;
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.seat.seat-vip.available:hover {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #b45309;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
}

/* VIP seat selected state - Higher priority */
.seat.seat-vip.selected {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
  border-color: #6d28d9 !important;
  color: white !important;
  transform: scale(1.1) !important;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6) !important;
  animation: vip-pulse 1.5s ease-in-out infinite;
}

/* Regular seat selected state */
.seat.seat-regular.selected {
  background: #667eea;
  border-color: #667eea;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

/* Couple seat styling */
.seat.seat-couple.available {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  border-color: #be185d;
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
}

.seat.seat-couple.available:hover {
  background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.5);
}

.seat.seat-couple.selected {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
  border-color: #6d28d9 !important;
  color: white !important;
  transform: scale(1.1) !important;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6) !important;
  animation: couple-pulse 1.5s ease-in-out infinite;
}

/* Disabled seat styling */
.seat.seat-disabled.available {
  background: #9ca3af;
  border-color: #6b7280;
  color: white;
  opacity: 0.7;
}

.seat.seat-disabled.selected {
  background: #667eea !important;
  border-color: #667eea !important;
  color: white !important;
  opacity: 1 !important;
}

/* Universal selected state override */
.seat.selected {
  position: relative;
  z-index: 10;
}

.seat.selected::before {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  font-weight: 800;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Animation for VIP seats */
@keyframes vip-pulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6);
  }
  50% {
    box-shadow: 0 6px 30px rgba(139, 92, 246, 0.8);
  }
}

@keyframes couple-pulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6);
  }
  50% {
    box-shadow: 0 6px 30px rgba(139, 92, 246, 0.8);
  }
}

.selected-info {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 2px solid #667eea;
  text-align: center;
}

.selected-info h3 {
  margin-bottom: 1rem;
  color: #1f2937;
}

.selected-list {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.selected-seat {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.total-price {
  font-size: 1.5rem;
  color: #dc2626;
  margin-bottom: 2rem;
}

.booking-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .seat-selection {
    padding: 1rem;
  }
  
  .showtime-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .seat-legend {
    gap: 1rem;
  }
  
  .booking-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .seat {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
  
  .seat.selected::before {
    width: 14px;
    height: 14px;
    top: -7px;
    right: -7px;
    font-size: 8px;
  }
}
</style>
