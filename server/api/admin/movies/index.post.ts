import prisma from '../../../utils/prisma'
import type { MovieStatus } from '@prisma/client'

interface CreateMovieBody {
  title: string
  description: string
  duration: number
  genre: string
  director: string
  cast: string
  rating?: number
  poster: string
  trailer?: string
  releaseDate: string
  status: MovieStatus
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateMovieBody>(event)
    
    // Validation
    const requiredFields = ['title', 'description', 'duration', 'genre', 'director', 'cast', 'poster', 'releaseDate', 'status']
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateMovieBody])
    
    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`
      })
    }

    // Additional validations
    if (body.duration <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Thời lượng phim phải lớn hơn 0'
      })
    }

    if (body.rating && (body.rating < 0 || body.rating > 10)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Đánh giá phải từ 0-10'
      })
    }

    // Check if movie title already exists
    const existingMovie = await prisma.movie.findFirst({
      where: { title: body.title }
    })

    if (existingMovie) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Tên phim đã tồn tại trong hệ thống'
      })
    }

    const movie = await prisma.movie.create({
      data: {
        title: body.title.trim(),
        description: body.description.trim(),
        duration: body.duration,
        genre: body.genre.trim(),
        director: body.director.trim(),
        cast: body.cast.trim(),
        rating: body.rating || null,
        poster: body.poster.trim(),
        trailer: body.trailer?.trim() || null,
        releaseDate: new Date(body.releaseDate),
        status: body.status
      }
    })

    return {
      success: true,
      message: 'Tạo phim thành công',
      data: movie
    }
  } catch (error: unknown) {
    console.error('Create movie error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: `Lỗi máy chủ: ${error.message}`
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể tạo phim mới'
    })
  }
})
