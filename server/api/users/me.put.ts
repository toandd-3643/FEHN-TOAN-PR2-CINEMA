import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'
import type { User } from '@prisma/client'

interface JWTPayload {
  userId: number
  email: string
}

interface UpdateUserBody {
  fullName: string
  phone?: string
  avatar?: string
}

type ApiResponse = {
  success: boolean
  message: string
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

    const userExists = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true }
    })

    if (!userExists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tài khoản không tồn tại hoặc đã bị xóa'
      })
    }

    const body = await readBody<UpdateUserBody>(event)

    if (!body.fullName?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Họ tên không được để trống'
      })
    }

    if (body.phone && !/^[0-9+\-\s()]{10,15}$/.test(body.phone.trim())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Số điện thoại không hợp lệ'
      })
    }

    const dataUpdate: Partial<Pick<User, 'fullName' | 'phone' | 'avatar'>> = {
      fullName: body.fullName.trim(),
      phone: body.phone?.trim() || null,
      avatar: body.avatar?.trim() || null
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: dataUpdate
    })

    return { 
      success: true, 
      message: 'Cập nhật thông tin thành công' 
    }

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string }
      
      switch (prismaError.code) {
        case 'P2002':
          throw createError({
            statusCode: 409,
            statusMessage: 'Email hoặc số điện thoại đã tồn tại'
          })
        case 'P2025':
          throw createError({
            statusCode: 404,
            statusMessage: 'Tài khoản không tồn tại'
          })
        default:
          throw createError({
            statusCode: 500,
            statusMessage: 'Lỗi cơ sở dữ liệu khi cập nhật thông tin'
          })
      }
    }

    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Lỗi máy chủ: ${error.message}`
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Cập nhật thông tin thất bại - Lỗi không xác định'
    })
  }
})
