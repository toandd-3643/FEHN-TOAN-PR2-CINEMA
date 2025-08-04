import prisma from '../../utils/prisma'
import type { News } from '@prisma/client'

type NewsListResponse = {
  success: boolean
  data: Pick<News, 'id' | 'title' | 'content' | 'image' | 'author' | 'createdAt'>[]
}

export default defineEventHandler(async (): Promise<NewsListResponse> => {
  try {
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        author: true,
        createdAt: true
      }
    })
    
    return { success: true, data: news }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Lỗi máy chủ: ${error.message}`
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể lấy danh sách bài viết'
    })
  }
})
