import prisma from '../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
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

    const { showtimeId, seatIds } = body

    // Validation
    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Thông tin đặt vé không hợp lệ'
      })
    }

    // Sử dụng transaction
    const result = await prisma.$transaction(async (tx) => {
      // Kiểm tra showtime
      const showtime = await tx.showtime.findUnique({
        where: { id: parseInt(showtimeId) },
        include: {
          movie: true,
          screen: {
            include: {
              cinema: true
            }
          }
        }
      })

      if (!showtime) {
        throw new Error('Suất chiếu không tồn tại')
      }

      // Kiểm tra thời gian
      if (new Date() > showtime.startTime) {
        throw new Error('Không thể đặt vé cho suất chiếu đã bắt đầu')
      }

      // Lấy thông tin ghế
      const seats = await tx.seat.findMany({
        where: {
          id: { in: seatIds.map(id => parseInt(id)) },
          screenId: showtime.screenId,
          isActive: true
        }
      })

      if (seats.length !== seatIds.length) {
        throw new Error('Một số ghế không hợp lệ')
      }

      // Kiểm tra ghế đã được đặt chưa
      const existingBookings = await tx.bookingSeat.findMany({
        where: {
          seatId: { in: seats.map(s => s.id) },
          booking: {
            showtimeId: parseInt(showtimeId),
            status: { in: ['PENDING', 'CONFIRMED'] },
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        }
      })

      if (existingBookings.length > 0) {
        throw new Error('Một số ghế đã được đặt trước')
      }

      // Tính tổng giá
      let totalPrice = 0
      const seatPrices = seats.map(seat => {
        const price = calculateSeatPrice(seat.type, showtime.price)
        totalPrice += price
        return { seatId: seat.id, price }
      })

      // Tạo booking code
      const bookingCode = generateBookingCode()

      // Tạo booking
      const booking = await tx.booking.create({
        data: {
          userId,
          showtimeId: parseInt(showtimeId),
          seats: JSON.stringify(seats.map(s => `${s.row}${s.number}`)),
          totalPrice,
          bookingCode,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 phút
        }
      })

      // Tạo booking seats
      await tx.bookingSeat.createMany({
        data: seatPrices.map(sp => ({
          bookingId: booking.id,
          seatId: sp.seatId,
          price: sp.price
        }))
      })

      return {
        booking,
        seats,
        showtime
      }
    })

    return {
      success: true,
      data: {
        bookingId: result.booking.id,
        bookingCode: result.booking.bookingCode,
        totalPrice: result.booking.totalPrice,
        expiresAt: result.booking.expiresAt,
        seats: result.seats.map(s => `${s.row}${s.number}`),
        movie: result.showtime.movie.title,
        cinema: result.showtime.screen.cinema.name,
        startTime: result.showtime.startTime
      },
      message: 'Đặt vé thành công. Vui lòng thanh toán trong 15 phút.'
    }

  } catch (error: any) {    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Không thể tạo booking'
    })
  }
})

function calculateSeatPrice(seatType: string, basePrice: number): number {
  const priceMultipliers = {
    REGULAR: 1,
    VIP: 1.5,
    COUPLE: 1.8,
    DISABLED: 0.8
  }
  
  return Math.round(basePrice * (priceMultipliers[seatType] || 1))
}

function generateBookingCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MB${timestamp}${random}`
}
