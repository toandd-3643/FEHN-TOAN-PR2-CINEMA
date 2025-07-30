import prisma from '../../utils/prisma'
import { MovieStatus } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 2))
    const status = query.status as string || 'NOW_SHOWING'
    
    const skip = (page - 1) * limit
    
    console.log('API Query params:', { page, limit, status, skip })

    const validStatuses = Object.values(MovieStatus)
    const movieStatus = validStatuses.includes(status as MovieStatus) 
      ? (status as MovieStatus) 
      : MovieStatus.NOW_SHOWING

    let movies, totalCount

    try {
      totalCount = await prisma.movie.count({
        where: {
          status: movieStatus
        }
      })

      movies = await prisma.movie.findMany({
        where: {
          status: movieStatus
        },
        orderBy: [
          { rating: 'desc' },
          { releaseDate: 'desc' },
          { id: 'desc' }
        ],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          genre: true,
          director: true,
          cast: true,
          duration: true,
          rating: true,
          poster: true,
          trailer: true,
          releaseDate: true,
          status: true
        }
      })

    } catch (prismaError: any) {
      // ✅ Handle specific Prisma errors
      console.error('Prisma query error:', prismaError)
      
      if (prismaError.code === 'P2002') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Duplicate data conflict'
        })
      }
      
      if (prismaError.code === 'P2025') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Record not found'
        })
      }
      
      if (prismaError.code === 'P1001') {
        throw createError({
          statusCode: 503,
          statusMessage: 'Database connection failed'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Database query failed'
      })
    }

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const paginationMeta = {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
      startIndex: skip + 1,
      endIndex: Math.min(skip + limit, totalCount)
    }

    return {
      success: true,
      data: movies,
      pagination: paginationMeta,
      filters: {
        status: movieStatus
      },
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('General API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request parameters'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error occurred'
    })
  }
})
