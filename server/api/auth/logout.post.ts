export default defineEventHandler(async (event) => {
  // Clear auth cookie
  setCookie(event, 'auth-token', '', {
    maxAge: 0,
    httpOnly: false,
    secure: true,
    sameSite: 'strict'
  })

  return {
    success: true,
    message: 'Đăng xuất thành công'
  }
})
