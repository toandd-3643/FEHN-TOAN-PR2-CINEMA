export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  if (process.client) {
    if (!authStore.isLoggedIn) {
      const returnUrl = to.fullPath
      return navigateTo(`/login?redirect=${encodeURIComponent(returnUrl)}`)
    }
  }
})
