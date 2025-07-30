import prisma from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const bookingId = getRouterParam(event, 'id')
    
    if (!bookingId || isNaN(parseInt(bookingId))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID booking không hợp lệ'
      })
    }

    // Xác thực user
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

    const id = parseInt(bookingId)

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: {
          showtime: {
            include: {
              movie: true,
              screen: {
                include: {
                  cinema: true
                }
              }
            }
          },
          bookingSeats: {
            include: {
              seat: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error('Booking không tồn tại')
      }

      if (booking.userId !== userId) {
        throw new Error('Không có quyền truy cập booking này')
      }

      if (booking.status !== 'PENDING') {
        throw new Error('Booking đã được xử lý')
      }

      // Kiểm tra hết hạn
      if (booking.expiresAt && new Date() > booking.expiresAt) {
        await tx.booking.update({
          where: { id },
          data: { status: 'EXPIRED' }
        })
        throw new Error('Booking đã hết hạn')
      }

      // Cập nhật booking
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          expiresAt: null
        }
      })

      return {
        booking: updatedBooking,
        showtime: booking.showtime,
        seats: booking.bookingSeats.map(bs => bs.seat)
      }
    })

    return {
      success: true,
      data: {
        bookingCode: result.booking.bookingCode,
        status: result.booking.status,
        movie: result.showtime.movie.title,
        cinema: result.showtime.screen.cinema.name,
        startTime: result.showtime.startTime,
        seats: result.seats.map(s => `${s.row}${s.number}`),
        totalPrice: result.booking.totalPrice
      },
      message: 'Thanh toán thành công!'
    }

  } catch (error: any) {
    console.error('Confirm booking error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Không thể xác nhận thanh toán'
    })
  }
})
