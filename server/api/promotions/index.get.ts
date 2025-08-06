import prisma from '../../utils/prisma'
import type { Promotion } from '@prisma/client'

type PromotionResponse = {
  success: boolean
  data: Promotion[]
}

export default defineEventHandler(async (): Promise<PromotionResponse> => {
  try {
    const currentDate = new Date()
    
    const promotions = await prisma.promotion.findMany({
      where: {
        active: true,
        startDate: {
          lte: currentDate
        },
        endDate: {
          gte: currentDate
        }
      },
      orderBy: [
        { endDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    return { 
      success: true, 
      data: promotions 
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Lỗi máy chủ: ${error.message}`
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể lấy danh sách khuyến mãi'
    })
  }
})
