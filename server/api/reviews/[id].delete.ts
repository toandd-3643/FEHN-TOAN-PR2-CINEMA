// server/api/reviews/[id].delete.ts
import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const reviewId = getRouterParam(event, 'id')
    
    if (!reviewId || isNaN(parseInt(reviewId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID đánh giá không hợp lệ'
      })
    }

    // Kiểm tra authentication
    const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Vui lòng đăng nhập'
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

    const id = parseInt(reviewId)

    const result = await prisma.$transaction(async (tx) => {
      // Lấy thông tin review để check permission và movieId
      const review = await tx.review.findUnique({
        where: { id },
        select: {
          userId: true,
          movieId: true,
          user: {
            select: {
              role: true
            }
          }
        }
      })

      if (!review) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Không tìm thấy đánh giá'
        })
      }

      // Check permission: chỉ user tạo review hoặc admin mới được xóa
      if (review.userId !== userId && review.user.role !== 'ADMIN') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Bạn không có quyền xóa đánh giá này'
        })
      }

      // Xóa review
      await tx.review.delete({
        where: { id }
      })

      const averageRating = await tx.review.aggregate({
        where: {
          movieId: review.movieId
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      })

      const newAverageRating = averageRating._avg.rating || 0
      const roundedRating = Math.round(newAverageRating * 10) / 10

      await tx.movie.update({
        where: { id: review.movieId },
        data: {
          rating: roundedRating
        }
      })

      return {
        movieId: review.movieId,
        newAverageRating: roundedRating,
        totalReviews: averageRating._count.rating
      }
    })

    return {
      success: true,
      message: 'Xóa đánh giá thành công',
      movieRating: {
        average: result.newAverageRating,
        totalReviews: result.totalReviews
      }
    }

  } catch (error: any) {    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể xóa đánh giá'
    })
  }
})
