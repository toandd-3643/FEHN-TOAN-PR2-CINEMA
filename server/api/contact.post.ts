import prisma from '../utils/prisma'
import { ContactType } from '@prisma/client'

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9+\-\s()]{10,15}$/
  return phoneRegex.test(phone)
}

const ALLOWED_CONTACT_TYPES = Object.values(ContactType)

interface ContactRequestBody {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type?: ContactType
}

interface ContactResponse {
  success: boolean
  message: string
  data: {
    id: number
    createdAt: Date
  }
}

export default defineEventHandler(async (event): Promise<ContactResponse> => {
  try {
    const body = await readBody<ContactRequestBody>(event)
    const { name, email, phone, subject, message, type } = body

    if (!name || !email || !subject || !message) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
      })
    }

    if (!isValidEmail(email)) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Email không hợp lệ' 
      })
    }

    if (phone && !isValidPhone(phone.trim())) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Số điện thoại không hợp lệ' 
      })
    }

    if (type && !ALLOWED_CONTACT_TYPES.includes(type)) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Loại yêu cầu không hợp lệ' 
      })
    }

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        type: type || 'SUPPORT',
        status: 'PENDING'
      }
    })

    return {
      success: true,
      message: 'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      data: {
        id: contact.id,
        createdAt: contact.createdAt
      }
    }

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể gửi yêu cầu. Vui lòng thử lại sau.'
    })
  }
})
