<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Tổng quan hệ thống MovieBooking</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="mdi:movie" size="32" />
        </div>
        <div class="stat-content">
          <h3>{{ stats.movies }}</h3>
          <p>Tổng số phim</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="mdi:account-group" size="32" />
        </div>
        <div class="stat-content">
          <h3>{{ stats.users }}</h3>
          <p>Người dùng</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="mdi:ticket" size="32" />
        </div>
        <div class="stat-content">
          <h3>{{ stats.bookings }}</h3>
          <p>Đặt vé hôm nay</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <Icon name="mdi:currency-usd" size="32" />
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(stats.revenue) }}</h3>
          <p>Doanh thu tháng</p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="recent-bookings">
        <h2>Đặt vé gần đây</h2>
        <!-- Add recent bookings table here -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

const stats = ref({
  movies: 0,
  users: 0,
  bookings: 0,
  revenue: 0
})

const loadStats = async () => {
  try {
    const [moviesCount, usersCount] = await Promise.all([
      $fetch('/api/admin/movies?limit=1'),
      // Add other stat API calls
    ])
    
    stats.value.movies = moviesCount.pagination?.total || 0
  } catch (error) {
    console.error('Load stats error:', error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

onMounted(loadStats)
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #64748b;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: #3498db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.dashboard-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.recent-bookings h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
}
</style>
