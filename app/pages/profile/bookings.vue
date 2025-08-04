<template>
  <div class="my-bookings-page">
    <h1>Lịch sử đặt vé</h1>
    <div v-if="pending" class="loading">
      <Icon name="mdi:loading" class="spin" size="32" /> Đang tải...
    </div>
    <div v-else-if="error" class="error">
      <Icon name="mdi:alert-circle" /> Không thể lấy dữ liệu!
    </div>
    <div v-else-if="!bookings.length" class="empty">
      <Icon name="mdi:ticket" size="48" /> Bạn chưa đặt vé nào
    </div>
    <div v-else class="bookings-list">
      <BookingCard
        v-for="booking in bookings"
        :key="booking.id"
        :booking="booking"
      />
    </div>
  </div>
</template>

<script setup>
const { data, pending, error } = await useFetch('/api/bookings/my', { key: 'my-bookings' })
const bookings = computed(() => data.value?.data || [])
</script>

<style scoped>
.my-bookings-page { max-width: 800px; margin: 0 auto; padding: 2rem 0; }
h1 { margin-bottom: 1.5rem; }
.loading, .error, .empty { text-align: center; color: #7c3aed; padding: 2rem 0; }
.bookings-list { display: flex; flex-direction: column; gap: 2rem; }
</style>
