<template>
  <div class="auth-layout">
    <div class="auth-container">
      <!-- Brand Header -->
      <div class="auth-brand">
        <NuxtLink to="/" class="brand-link">
          <h1 class="brand-title">🎬 MovieBooking</h1>
          <p class="brand-subtitle">Đặt vé xem phim online</p>
        </NuxtLink>
      </div>
      
      <!-- Auth Content -->
      <div class="auth-content">
        <slot />
      </div>
      
      <!-- Footer -->
      <div class="auth-footer">
        <p>&copy; 2024 MovieBooking. All rights reserved.</p>
      </div>
    </div>
    
    <!-- Background -->
    <div class="auth-background">
      <div class="auth-overlay"></div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-container {
  max-width: 450px;
  width: 100%;
  margin: 0 20px;
  z-index: 10;
}

.auth-brand {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-link {
  text-decoration: none;
  color: white;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.auth-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: white;
  opacity: 0.8;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.auth-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .auth-container {
    margin: 0 15px;
  }
  
  .brand-title {
    font-size: 2rem;
  }
}
</style>
