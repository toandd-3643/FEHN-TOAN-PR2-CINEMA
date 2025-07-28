import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { fullName, email, phone, password } = await readBody(event)

    // Validation
    if (!fullName || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Họ tên, email và mật khẩu là bắt buộc'
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Mật khẩu phải có ít nhất 6 ký tự'
      })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email này đã được sử dụng'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 'USER'
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        user: userWithoutPassword
      },
      message: 'Đăng ký thành công'
    }
  } catch (error) {
    throw error
  }
})
