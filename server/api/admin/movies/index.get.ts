import prisma from '../../../utils/prisma'
import type { Movie, MovieStatus } from '@prisma/client'

interface MoviesQuery {
  page?: string
  limit?: string
  status?: MovieStatus
  search?: string
}

interface MoviesResponse {
  success: boolean
  data: Movie[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default defineEventHandler(async (event): Promise<MoviesResponse> => {
  try {
    const query = getQuery(event) as MoviesQuery
    
    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '10')
    const skip = (page - 1) * limit
    
    // Build where conditions
    const where: any = {}
    
    if (query.status) {
      where.status = query.status
    }
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { director: { contains: query.search } },
        { genre: { contains: query.search } }
      ]
    }

    // Get movies with pagination
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { releaseDate: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.movie.count({ where })
    ])

    return {
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: unknown) {
    console.error('Get movies error:', error)
    
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Lỗi máy chủ: ${error.message}`
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể lấy danh sách phim'
    })
  }
})
