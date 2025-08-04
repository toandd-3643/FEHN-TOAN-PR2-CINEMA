import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Vui lòng đăng nhập' })

  let userId
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    userId = decoded.userId
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Token không hợp lệ' })
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      showtime: {
        include: {
          movie: true,
          screen: { include: { cinema: true } }
        }
      }
    }
  })

  const data = bookings.map(b => ({
    id: b.id,
    bookingCode: b.bookingCode,
    status: b.status,
    totalPrice: b.totalPrice,
    seats: JSON.parse(b.seats),
    createdAt: b.createdAt,
    showtime: {
      id: b.showtime.id,
      startTime: b.showtime.startTime,
      endTime: b.showtime.endTime,
      movie: { id: b.showtime.movie.id, title: b.showtime.movie.title, poster: b.showtime.movie.poster },
      cinema: {
        name: b.showtime.screen.cinema.name,
        address: b.showtime.screen.cinema.address
      },
      screen: { name: b.showtime.screen.name }
    }
  }))

  return { success: true, data }
})
