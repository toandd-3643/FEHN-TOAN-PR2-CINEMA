<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>MovieBooking Admin</h2>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/admin" class="nav-item" active-class="active">
          <Icon name="mdi:view-dashboard" />
          Dashboard
        </NuxtLink>
        
        <NuxtLink to="/admin/movies" class="nav-item" active-class="active">
          <Icon name="mdi:movie" />
          Quản lý phim
        </NuxtLink>
        
        <NuxtLink to="/admin/cinemas" class="nav-item" active-class="active">
          <Icon name="mdi:theater" />
          Quản lý rạp
        </NuxtLink>
        
        <NuxtLink to="/admin/bookings" class="nav-item" active-class="active">
          <Icon name="mdi:ticket" />
          Quản lý đặt vé
        </NuxtLink>
        
        <NuxtLink to="/admin/users" class="nav-item" active-class="active">
          <Icon name="mdi:account-group" />
          Quản lý người dùng
        </NuxtLink>
        
        <NuxtLink to="/admin/contacts" class="nav-item" active-class="active">
          <Icon name="mdi:message" />
          Liên hệ hỗ trợ
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <button @click="toggleSidebar" class="sidebar-toggle">
            <Icon name="mdi:menu" />
          </button>
        </div>
        
        <div class="header-right">
          <div class="user-menu">
            <div class="user-info">
              <img :src="user?.avatar || '/default-avatar.png'" :alt="user?.fullName" class="user-avatar" />
              <span class="user-name">{{ user?.fullName }}</span>
            </div>
            <div class="user-dropdown">
              <NuxtLink to="/admin/profile" class="dropdown-item">
                <Icon name="mdi:account" />
                Thông tin cá nhân
              </NuxtLink>
              <button @click="logout" class="dropdown-item">
                <Icon name="mdi:logout" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

onMounted(async () => {
  try {
    if (!user.value) {
      await useAuth().fetchUser()
    }
  } catch (error) {
    await navigateTo('/login')
  }
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-sidebar {
  width: 280px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
  display: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: #1e293b;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.user-menu:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #374151;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 20;
    transform: translateX(-100%);
  }
  
  .sidebar-toggle {
    display: block;
  }
  
  .admin-main {
    margin-left: 0;
  }
}
</style>
