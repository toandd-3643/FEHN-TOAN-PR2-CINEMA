<template>
  <div class="booking-confirm">
    <div class="booking-summary">
      <h2>Xác nhận đặt vé</h2>
      
      <div class="booking-info">
        <div class="info-section">
          <h3>Thông tin phim</h3>
          <div class="info-grid">
            <div class="info-item">
              <Icon name="mdi:movie" />
              <div>
                <strong>Phim</strong>
                <span>{{ bookingData.movie }}</span>
              </div>
            </div>
            <div class="info-item">
              <Icon name="mdi:home" />
              <div>
                <strong>Rạp</strong>
                <span>{{ bookingData.cinema }}</span>
              </div>
            </div>
            <div class="info-item">
              <Icon name="mdi:clock" />
              <div>
                <strong>Suất chiếu</strong>
                <span>{{ formatDateTime(bookingData.startTime) }}</span>
              </div>
            </div>
            <div class="info-item">
              <Icon name="mdi:seat" />
              <div>
                <strong>Ghế</strong>
                <span>{{ bookingData.seats.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Thông tin thanh toán</h3>
          <div class="payment-info">
            <div class="booking-code">
              <strong>Mã đặt vé: {{ bookingData.bookingCode }}</strong>
            </div>
            <div class="total-amount">
              <span>Tổng tiền:</span>
              <strong>{{ formatPrice(bookingData.totalPrice) }}</strong>
            </div>
            <div class="expires-info">
              <Icon name="mdi:timer" />
              <span>Hết hạn sau: {{ timeRemaining }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="payment-section">
      <h3>Phương thức thanh toán</h3>
      <div class="payment-methods">
        <label class="payment-method">
          <input type="radio" value="cash" v-model="paymentMethod" />
          <div class="method-info">
            <Icon name="mdi:cash" size="24" />
            <div>
              <strong>Tiền mặt</strong>
              <span>Thanh toán tại quầy rạp</span>
            </div>
          </div>
        </label>
        
        <label class="payment-method">
          <input type="radio" value="card" v-model="paymentMethod" />
          <div class="method-info">
            <Icon name="mdi:credit-card" size="24" />
            <div>
              <strong>Thẻ tín dụng</strong>
              <span>Thanh toán online</span>
            </div>
          </div>
        </label>
      </div>
    </div>

    <div class="confirm-actions">
      <button @click="$emit('back')" class="btn btn-outline">
        <Icon name="mdi:arrow-left" />
        Quay lại
      </button>
      <button 
        @click="confirmPayment" 
        :disabled="!paymentMethod || isConfirming"
        class="btn btn-primary"
      >
        <Icon v-if="isConfirming" name="mdi:loading" class="spin" />
        <Icon v-else name="mdi:check" />
        {{ isConfirming ? 'Đang xử lý...' : 'Xác nhận thanh toán' }}
      </button>
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

const emit = defineEmits(['back', 'payment-confirmed'])

// State
const paymentMethod = ref('cash')
const isConfirming = ref(false)
const timeLeft = ref(0)

// Calculate time remaining
const updateTimeRemaining = () => {
  if (props.bookingData.expiresAt) {
    const now = new Date().getTime()
    const expires = new Date(props.bookingData.expiresAt).getTime()
    timeLeft.value = Math.max(0, expires - now)
  }
}

const timeRemaining = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60000)
  const seconds = Math.floor((timeLeft.value % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Timer
const timer = setInterval(updateTimeRemaining, 1000)
updateTimeRemaining()

onUnmounted(() => {
  clearInterval(timer)
})

// Methods
const confirmPayment = async () => {
  isConfirming.value = true
  
  try {
    const response = await $fetch(`/api/bookings/${props.bookingData.bookingId}/confirm`, {
      method: 'POST',
      body: {
        paymentMethod: paymentMethod.value
      }
    })
    
    if (response.success) {
      emit('payment-confirmed', {
        ...response.data,
        paymentMethod: paymentMethod.value
      })
    }
  } catch (error) {
    console.error('Payment error:', error)
    alert(error.data?.message || 'Có lỗi xảy ra khi thanh toán')
  } finally {
    isConfirming.value = false
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
.booking-confirm {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.booking-summary {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.booking-summary h2 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.info-item svg {
  color: #667eea;
  flex-shrink: 0;
}

.info-item div {
  display: flex;
  flex-direction: column;
}

.info-item strong {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-item span {
  color: #1f2937;
  font-weight: 600;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.booking-code {
  text-align: center;
  padding: 1rem;
  background: #667eea;
  color: white;
  border-radius: 8px;
  font-size: 1.1rem;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  padding: 1rem 0;
  border-top: 2px solid #e5e7eb;
}

.total-amount strong {
  color: #dc2626;
  font-size: 1.5rem;
}

.expires-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  color: #f59e0b;
  font-weight: 600;
}

.payment-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.payment-section h3 {
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-method:hover {
  border-color: #667eea;
}

.payment-method input[type="radio"] {
  margin-right: 1rem;
}

.payment-method input[type="radio"]:checked + .method-info {
  color: #667eea;
}

.method-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.method-info div {
  display: flex;
  flex-direction: column;
}

.method-info strong {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.method-info span {
  font-size: 0.9rem;
  color: #6b7280;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
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

@media (max-width: 768px) {
  .booking-confirm {
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .confirm-actions {
    flex-direction: column;
  }
}
</style>
