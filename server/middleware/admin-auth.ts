import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma'

interface JWTPayload {
  userId: number
  email: string
}

export default defineEventHandler(async (event) => {
  if (!event.node.req.url?.startsWith('/api/admin')) {
    return
  }

  const token = getCookie(event, 'auth-token') || 
                getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token xác thực không tồn tại. Vui lòng đăng nhập.'
    })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Cấu hình bảo mật không hợp lệ'
    })
  }

  let decoded: JWTPayload
  try {
    decoded = jwt.verify(token, jwtSecret) as JWTPayload
  } catch (jwtError: unknown) {
    if (jwtError instanceof jwt.TokenExpiredError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token đã hết hạn. Vui lòng đăng nhập lại.'
      })
    }
    throw createError({
      statusCode: 401,
      statusMessage: 'Token không hợp lệ'
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, fullName: true, role: true }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tài khoản không tồn tại'
    })
  }

  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bạn không có quyền truy cập. Chỉ admin mới có thể thực hiện thao tác này.'
    })
  }

  event.context.user = user
})
