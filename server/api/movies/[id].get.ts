import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const movieId = getRouterParam(event, 'id')
    
    if (!movieId || isNaN(parseInt(movieId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID phim không hợp lệ'
      })
    }

    const id = parseInt(movieId)

    // Lấy thông tin phim chi tiết
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        showtimes: {
          include: {
            screen: {
              include: {
                cinema: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true
                  }
                }
              }
            }
          },
          where: {
            startTime: {
              gte: new Date() // Chỉ lấy suất chiếu tương lai
            }
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 10
        }
      }
    })

    if (!movie) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy phim'
      })
    }

    // Tính điểm đánh giá trung bình
    const totalReviews = movie.reviews.length
    const averageRating = totalReviews > 0 
      ? movie.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0

    // Thống kê đánh giá theo sao
    const ratingStats = {
      5: movie.reviews.filter(r => r.rating === 5).length,
      4: movie.reviews.filter(r => r.rating === 4).length,
      3: movie.reviews.filter(r => r.rating === 3).length,
      2: movie.reviews.filter(r => r.rating === 2).length,
      1: movie.reviews.filter(r => r.rating === 1).length
    }

    return {
      success: true,
      data: {
        ...movie,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        ratingStats
      }
    }

  } catch (error: any) {
    console.error('Movie detail API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể lấy thông tin phim'
    })
  }
})
