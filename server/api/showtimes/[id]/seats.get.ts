import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const showtimeId = getRouterParam(event, 'id')
    
    if (!showtimeId || isNaN(parseInt(showtimeId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID suất chiếu không hợp lệ'
      })
    }

    const id = parseInt(showtimeId)

    // Lấy thông tin showtime và ghế
    const showtime = await prisma.showtime.findUnique({
      where: { id },
      include: {
        movie: {
          select: {
            title: true,
            duration: true,
            poster: true
          }
        },
        screen: {
          include: {
            cinema: {
              select: {
                name: true,
                address: true
              }
            },
            seats: {
              orderBy: [
                { row: 'asc' },
                { number: 'asc' }
              ]
            }
          }
        }
      }
    })

    if (!showtime) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy suất chiếu'
      })
    }

    // Lấy ghế đã được đặt
    const bookedSeats = await prisma.bookingSeat.findMany({
      where: {
        booking: {
          showtimeId: id,
          status: {
            in: ['PENDING', 'CONFIRMED']
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      },
      include: {
        seat: true
      }
    })

    const bookedSeatIds = new Set(bookedSeats.map(bs => bs.seatId))

    // Nhóm ghế theo hàng
    const seatMap = showtime.screen.seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = []
      }
      
      acc[seat.row].push({
        ...seat,
        isBooked: bookedSeatIds.has(seat.id),
        price: calculateSeatPrice(seat.type, showtime.price)
      })
      
      return acc
    }, {} as Record<string, any[]>)

    return {
      success: true,
      data: {
        showtime: {
          id: showtime.id,
          startTime: showtime.startTime,
          endTime: showtime.endTime,
          basePrice: showtime.price,
          movie: showtime.movie,
          screen: {
            name: showtime.screen.name,
            cinema: showtime.screen.cinema
          }
        },
        seats: seatMap
      }
    }

  } catch (error: any) {
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Không thể lấy thông tin ghế'
    })
  }
})

// Tính giá ghế theo loại
function calculateSeatPrice(seatType: string, basePrice: number): number {
  const priceMultipliers = {
    REGULAR: 1,
    VIP: 1.5,
    COUPLE: 1.8,
    DISABLED: 0.8
  }
  
  return Math.round(basePrice * (priceMultipliers[seatType] || 1))
}
