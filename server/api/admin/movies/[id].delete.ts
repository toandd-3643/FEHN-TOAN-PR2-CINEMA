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

    const existingMovie = await prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          select: { id: true }
        }
      }
    })

    if (!existingMovie) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy phim'
      })
    }

    if (existingMovie.showtimes.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Không thể xóa phim đã có lịch chiếu. Vui lòng xóa lịch chiếu trước.'
      })
    }

    await prisma.movie.delete({
      where: { id }
    })

    return {
      success: true,
      message: 'Xóa phim thành công'
    }
  } catch (error: unknown) {
    console.error('Delete movie error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể xóa phim'
    })
  }
})
