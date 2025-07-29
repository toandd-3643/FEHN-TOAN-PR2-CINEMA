export default defineNuxtRouteMiddleware((to) => {
  // ✅ Kiểm tra store có tồn tại không
  if (typeof useAuthStore !== 'function') {
    return
  }
  
  const authStore = useAuthStore()
  
  // ✅ Kiểm tra isLoggedIn là reactive value
  if (authStore.isLoggedIn) {
    return navigateTo('/')
  }
})