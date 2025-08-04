import prisma from '../../utils/prisma'
import type { Cinema } from '@prisma/client'

type CinemasResponse = {
  success: boolean
  data: Cinema[]
}

export default defineEventHandler(async (): Promise<CinemasResponse> => {
  try {
    const cinemas = await prisma.cinema.findMany({
      orderBy: { name: 'asc' }
    })
    
    return { 
      success: true, 
      data: cinemas 
    }
  } catch (error: unknown) {
    
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
      statusMessage: 'Không thể lấy danh sách rạp - Lỗi không xác định'
    })
  }
})
