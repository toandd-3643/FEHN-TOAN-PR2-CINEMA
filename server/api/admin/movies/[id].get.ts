import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID phim không hợp lệ'
      })
    }

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          include: {
            screen: {
              include: {
                cinema: true
              }
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                fullName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!movie) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy phim'
      })
    }

    return {
      success: true,
      data: movie
    }
  } catch (error: unknown) {
    console.error('Get movie detail error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể lấy thông tin phim'
    })
  }
})
