import prisma from '../../utils/prisma'
import type { News } from '@prisma/client'

type NewsDetailResponse = {
  success: boolean
  data: Omit<News, 'updatedAt'>
}

export default defineEventHandler(async (event): Promise<NewsDetailResponse> => {
  try {
    const rawId = event.context.params.id
    if (rawId === undefined || rawId === null || rawId === '') {
      throw createError({ statusCode: 400, statusMessage: 'Thiếu ID bài viết' })
    }
    const id = Number(rawId)
    if (isNaN(id) || id <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'ID bài viết không hợp lệ' })
    }

    const news = await prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        author: true,
        published: true,
        createdAt: true
      }
    })

    if (!news || !news.published) {
      throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy bài viết' })
    }

    return { success: true, data: news }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Lấy chi tiết bài viết thất bại: ${error.message}`
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Lấy chi tiết bài viết thất bại.'
    })
  }
})
