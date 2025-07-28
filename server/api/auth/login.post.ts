import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { email, password, rememberMe } = await readBody(event)

    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email và mật khẩu là bắt buộc'
      })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email hoặc mật khẩu không đúng'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email hoặc mật khẩu không đúng'
      })
    }

    // Generate JWT token
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      config.jwtSecret,
      { 
        expiresIn: rememberMe ? '30d' : '1d'
      }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Đăng nhập thành công'
    }
  } catch (error) {
    throw error
  }
})
