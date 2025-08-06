import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'
import type { User } from '@prisma/client'

interface JWTPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

type UserResponse = Pick<User, 'id' | 'email' | 'fullName' | 'phone' | 'avatar'>

type ApiResponse = {
  success: boolean
  data: UserResponse
}

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  try {
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
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Token không hợp lệ'
        })
      }
      throw createError({
        statusCode: 401,
        statusMessage: 'Lỗi xác thực token'
      })
    }

    if (!decoded.userId || typeof decoded.userId !== 'number') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token không chứa thông tin người dùng hợp lệ'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true
      }
    })

    if (!user) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Tài khoản không tồn tại hoặc đã bị xóa' 
      })
    }

    return { success: true, data: user }

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string }
      throw createError({
        statusCode: 500,
        statusMessage: `Lỗi cơ sở dữ liệu: ${prismaError.message}`
      })
    }

    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Lỗi máy chủ: ${error.message}`
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Lỗi không xác định khi lấy thông tin người dùng'
    })
  }
})
