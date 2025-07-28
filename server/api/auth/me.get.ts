import jwt from 'jsonwebtoken'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token không hợp lệ'
      })
    }

    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Người dùng không tồn tại'
      })
    }

    return {
      success: true,
      data: {
        user
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token không hợp lệ'
    })
  }
})
