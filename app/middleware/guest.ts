export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuthStore()
  
  if (isLoggedIn) {
    return navigateTo('/')
  }
})
