<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <nav class="container">
        <div class="nav-brand">
          <NuxtLink to="/" class="brand-link">
            🎬 MovieBooking
          </NuxtLink>
        </div>
        <div class="nav-links">
          <NuxtLink to="/">Phim</NuxtLink>
          <NuxtLink to="/cinemas">Rạp</NuxtLink>
          <NuxtLink to="/news">Tin tức</NuxtLink>
          <NuxtLink to="/profile/bookings">Vé đã đặt</NuxtLink>
        </div>
        <div class="nav-actions">
          <template v-if="!authStore.isLoggedIn">
            <NuxtLink to="/login" class="btn btn-outline-sm">
              Đăng nhập
            </NuxtLink>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2024 MovieBooking. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.brand-link {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #667eea;
}

.btn-outline-sm {
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  color: #667eea;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-outline-sm:hover {
  background: #667eea;
  color: white;
}

.app-main {
  flex: 1;
}

.app-footer {
  background: #1f2937;
  color: white;
  padding: 2rem 0;
  text-align: center;
}

@media (max-width: 768px) {
  .app-header nav {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }
}
</style>
