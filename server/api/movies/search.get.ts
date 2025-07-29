import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== Search API Called ===')
    
    const query = getQuery(event)
    const searchTerm = query.q as string
    const limit = Math.min(10, Math.max(1, parseInt(query.limit as string) || 5))

    console.log('Search params:', { searchTerm, limit })

    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        success: false,
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự',
        data: []
      }
    }

    const trimmedSearch = searchTerm.trim()

    try {
      const testQuery = await prisma.movie.findFirst()
      console.log('Database test successful, sample movie:', testQuery?.title || 'No movies found')
    } catch (testError: any) {
      console.error('Database test failed:', testError)
      throw createError({
        statusCode: 503,
        statusMessage: 'Database connection failed'
      })
    }

 
    let movies
    try {
      console.log('Executing search query...')
      
      movies = await prisma.movie.findMany({
        where: {
          OR: [
            {
              title: {
                contains: trimmedSearch
              }
            },
            {
              genre: {
                contains: trimmedSearch
              }
            },
            {
              director: {
                contains: trimmedSearch
              }
            },
            {
              cast: {
                contains: trimmedSearch
              }
            }
          ]
        },
        orderBy: [
          { rating: 'desc' },
          { releaseDate: 'desc' },
          { id: 'desc' }
        ],
        take: limit,
        select: {
          id: true,
          title: true,
          genre: true,
          director: true,
          cast: true,
          rating: true,
          poster: true,
          status: true,
          releaseDate: true
        }
      })

      console.log(`Search completed. Found ${movies.length} movies`)

    } catch (prismaError: any) {
      console.error('=== Prisma Query Error ===')
      console.error('Error code:', prismaError.code)
      console.error('Error message:', prismaError.message)
      console.error('Error meta:', prismaError.meta)
      console.error('Full error:', prismaError)

      if (prismaError.code === 'P2025') {
        throw createError({
          statusCode: 404,
          statusMessage: 'No movies found'
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
        statusMessage: `Database query failed: ${prismaError.code || prismaError.message || 'Unknown error'}`
      })
    }

    return {
      success: true,
      data: movies,
      searchTerm: trimmedSearch,
      count: movies.length
    }

  } catch (error: any) {
    console.error('=== API Error ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: `Search failed: ${error.message || 'Unknown error'}`
    })
  }
})
