import prisma from '../../utils/prisma'
import type { Cinema, Movie, Screen, Showtime } from '@prisma/client'

type ShowtimeWithMovie = Showtime & {
  movie: Movie
}

type ScreenWithShowtimes = Screen & {
  showtimes: ShowtimeWithMovie[]
}

type CinemaWithScreensAndMovies = Cinema & {
  screens: ScreenWithShowtimes[]
  movies: Movie[]
}

type ApiResponse = {
  success: boolean
  data: CinemaWithScreensAndMovies
}

export default defineEventHandler(async (event): Promise<ApiResponse> => {
  try {
    const id = Number(event.context.params.id)
    
    if (isNaN(id) || id <= 0) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'ID rạp không hợp lệ. ID phải là số nguyên dương.' 
      })
    }

    const cinema = await prisma.cinema.findUnique({
      where: { id },
      include: {
        screens: {
          include: {
            showtimes: {
              where: { 
                movie: { status: 'NOW_SHOWING' } 
              },
              include: { 
                movie: true 
              },
              orderBy: { startTime: 'asc' }
            }
          }
        }
      }
    })

    if (!cinema) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Không tìm thấy rạp với ID được cung cấp' 
      })
    }

    const moviesMap = new Map<number, Movie>()
    
    cinema.screens.forEach((screen) => {
      screen.showtimes.forEach((showtime) => {
        if (showtime.movie && !moviesMap.has(showtime.movie.id)) {
          moviesMap.set(showtime.movie.id, showtime.movie)
        }
      })
    })
    
    const movies: Movie[] = Array.from(moviesMap.values())

    const response: ApiResponse = {
      success: true,
      data: {
        ...cinema,
        movies
      }
    }

    return response

  } catch (error: unknown) {    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string }
      
      switch (prismaError.code) {
        case 'P2025':
          throw createError({
            statusCode: 404,
            statusMessage: 'Rạp không tồn tại'
          })
        default:
          throw createError({
            statusCode: 500,
            statusMessage: 'Lỗi cơ sở dữ liệu'
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
      statusMessage: 'Lấy thông tin chi tiết rạp thất bại'
    })
  }
})
