import prisma from '../../../utils/prisma'
import type { Movie } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID phim không hợp lệ'
      })
    }

    // Check if movie exists
    const existingMovie = await prisma.movie.findUnique({
      where: { id }
    })

    if (!existingMovie) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy phim'
      })
    }

    const body = await readBody(event)
    
    // Prepare update data
    const updateData: Partial<Movie> = {}
    
    if (body.title) updateData.title = body.title.trim()
    if (body.description) updateData.description = body.description.trim()
    if (body.duration) updateData.duration = body.duration
    if (body.genre) updateData.genre = body.genre.trim()
    if (body.director) updateData.director = body.director.trim()
    if (body.cast) updateData.cast = body.cast.trim()
    if (body.rating !== undefined) updateData.rating = body.rating
    if (body.poster) updateData.poster = body.poster.trim()
    if (body.trailer !== undefined) updateData.trailer = body.trailer?.trim() || null
    if (body.releaseDate) updateData.releaseDate = new Date(body.releaseDate)
    if (body.status) updateData.status = body.status

    // Validation
    if (updateData.duration && updateData.duration <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Thời lượng phim phải lớn hơn 0'
      })
    }

    if (updateData.rating && (updateData.rating < 0 || updateData.rating > 10)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Đánh giá phải từ 0-10'
      })
    }

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: updateData
    })

    return {
      success: true,
      message: 'Cập nhật phim thành công',
      data: updatedMovie
    }
  } catch (error: unknown) {
    console.error('Update movie error:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể cập nhật phim'
    })
  }
})
