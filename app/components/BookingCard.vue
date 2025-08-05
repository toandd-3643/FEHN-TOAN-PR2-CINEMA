<template>
  <div class="booking-card">
    <div class="movie-block">
      <img v-if="booking.showtime.movie.poster" :src="booking.showtime.movie.poster" class="movie-poster" />
      <div>
        <h3>{{ booking.showtime.movie.title }}</h3>
        <div class="screen-info">
          <span>{{ booking.showtime.cinema.name }}</span> | 
          <span>{{ booking.showtime.screen.name }}</span>
        </div>
        <div class="address">{{ booking.showtime.cinema.address }}</div>
      </div>
    </div>
    <div class="info-block">
      <div>
        <Icon name="mdi:calendar" /> 
        {{ formatDateTime(booking.showtime.startTime) }}
      </div>
      <div>
        <Icon name="mdi:seat" />
        Ghế: 
        <span>{{ booking.seats.join(', ') }}</span>
      </div>
      <div>
        <Icon name="mdi:barcode" />
        Mã vé: 
        <span class="code">{{ booking.bookingCode }}</span>
      </div>
      <div>
        <Icon name="mdi:currency-usd" />
        <span>{{ formatPrice(booking.totalPrice) }}</span>
      </div>
      <div>
        <Icon name="mdi:information" />
        Trạng thái: 
        <span :class="['status', booking.status.toLowerCase()]">
          {{ getBookingStatusText(booking.status) }}
        </span>
      </div>
    </div>
    <div class="created-at">
      Đặt lúc: {{ formatDateTime(booking.createdAt) }}
    </div>
  </div>
</template>

<script setup>
import { getBookingStatusText } from '~/utils/constants'

const props = defineProps({ booking: Object })
const formatDateTime = date => new Date(date).toLocaleString('vi-VN')
const formatPrice = price => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
</script>

<style scoped>
.booking-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  background: white;
  flex-shrink: 0;
}
.movie-block { display: flex; gap: 1rem; margin-bottom: 1rem; }
.movie-poster { width: 90px; border-radius: 10px; aspect-ratio: 2/3; object-fit: cover; }
.screen-info, .address { color: #6b7280; font-size: 0.95em; }
.info-block { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 0.75rem 1.5rem; }
.code { font-family: monospace; font-weight: bold; }
.status { font-weight: bold; }
.status.pending { color: #f59e0b; }
.status.confirmed { color: #10b981; }
.status.cancelled, .status.expired { color: #ef4444; }
.created-at { text-align: right; margin-top: 1rem; color: #6b7280; font-size: 0.93em; }
</style>
