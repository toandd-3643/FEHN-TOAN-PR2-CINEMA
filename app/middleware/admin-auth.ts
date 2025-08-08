export default defineNuxtRouteMiddleware(async (to) => {
  console.log('🚀 === ADMIN MIDDLEWARE DEBUG ===')
  console.log('🌍 Process server:', process.server)
  console.log('📍 Route:', to.path)
  
  // Skip on server để tránh hydration mismatch
  if (process.server) {
    console.log('⏭️ Skipping on server')
    return
  }
  
  const { user, fetchUser } = useAuth()
  const authCookie = useCookie('auth-token')
  
  console.log('🍪 Token exists:', !!authCookie.value)
  console.log('👤 User state before:', user.value)
  
  // Nếu chưa có user, thử fetch
  if (!user.value) {
    console.log('🔄 Fetching user...')
    try {
      const userData = await fetchUser()
      console.log('✅ User fetched:', userData)
    } catch (error) {
      console.error('❌ Fetch user failed:', error)
      return navigateTo('/login')
    }
  }
  
  console.log('👤 User state after:', user.value)
  
  // Final check
  if (!user.value) {
    console.log('❌ No user - redirecting to login')
    return navigateTo('/login')
  }
  
  if (user.value.role !== 'ADMIN') {
    console.log('❌ User role not ADMIN:', user.value.role)
    throw createError({
      statusCode: 403,
      statusMessage: `Access denied. Your role: ${user.value.role}, Required: ADMIN`
    })
  }
  
  console.log('✅ Admin access granted')
})
