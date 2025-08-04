import prisma from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const movieId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!movieId || isNaN(parseInt(movieId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID phim không hợp lệ'
      })
    }

    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Vui lòng đăng nhập để đánh giá phim'
      })
    }

    let userId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      userId = decoded.userId
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token không hợp lệ'
      })
    }

    const { rating, comment } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Điểm đánh giá phải từ 1 đến 5 sao'
      })
    }

    if (comment && comment.length > 500) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bình luận không được quá 500 ký tự'
      })
    }

    const id = parseInt(movieId)

    // Kiểm tra phim có tồn tại không
    const movie = await prisma.movie.findUnique({
      where: { id }
    })

    if (!movie) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy phim'
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Kiểm tra user đã đánh giá phim này chưa
      const existingReview = await tx.review.findUnique({
        where: {
          userId_movieId: {
            userId,
            movieId: id
          }
        }
      })

      let review
      if (existingReview) {
        // Cập nhật đánh giá cũ
        review = await tx.review.update({
          where: {
            id: existingReview.id
          },
          data: {
            rating,
            comment: comment || null
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        })
      } else {
        // Tạo đánh giá mới
        review = await tx.review.create({
          data: {
            userId,
            movieId: id,
            rating,
            comment: comment || null
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true
              }
            }
          }
        })
      }

      const averageRating = await tx.review.aggregate({
        where: {
          movieId: id
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      })

      const newAverageRating = averageRating._avg.rating || 0
      const roundedRating = Math.round(newAverageRating * 10) / 10 // Làm tròn 1 chữ số thập phân

      await tx.movie.update({
        where: { id },
        data: {
          rating: roundedRating
        }
      })

      return {
        review,
        newAverageRating: roundedRating,
        totalReviews: averageRating._count.rating,
        isUpdate: !!existingReview
      }
    })

    return {
      success: true,
      data: result.review,
      movieRating: {
        average: result.newAverageRating,
        totalReviews: result.totalReviews
      },
      message: result.isUpdate ? 'Cập nhật đánh giá thành công' : 'Tạo đánh giá thành công'
    }

  } catch (error: any) {    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể tạo đánh giá'
    })
  }
})
