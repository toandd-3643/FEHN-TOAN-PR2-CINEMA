// prisma/seed-seats.ts
import { PrismaClient, SeatType } from '@prisma/client'

const prisma = new PrismaClient()

async function createSeatsForScreen(screenId: number, screenName: string) {
  console.log(`🎬 Creating 120 seats for ${screenName}...`)
  
  const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const seatsPerRow = 12
  
  let seatNumber = 1
  
  for (let rowIndex = 0; rowIndex < seatRows.length; rowIndex++) {
    const row = seatRows[rowIndex]
    
    for (let seatInRow = 1; seatInRow <= seatsPerRow; seatInRow++) {
      let seatType: SeatType = SeatType.REGULAR
      
      // Hàng A-G: Ghế thường (84 ghế)
      if (rowIndex <= 6) {
        seatType = SeatType.REGULAR
      }
      // Hàng H-I: Ghế VIP (24 ghế)
      else if (rowIndex <= 8) {
        seatType = SeatType.VIP
      }
      // Hàng J: Ghế đôi (12 ghế)
      else {
        seatType = SeatType.COUPLE
      }
      
      await prisma.seat.create({
        data: {
          screenId: screenId,
          row: row,
          number: seatInRow,
          type: seatType,
          isActive: true
        }
      })
      
      seatNumber++
    }
  }
  
  console.log(`✅ Created ${seatNumber - 1} seats for ${screenName}`)
}

async function main() {
  console.log('🎪 Starting seats generation...')
  
  const screens = await prisma.screen.findMany({
    include: {
      cinema: true
    }
  })
  
  if (screens.length === 0) {
    console.log('⚠️ No screens found. Creating sample screens first...')
    
    // Tạo cinema mẫu
    const sampleCinema = await prisma.cinema.create({
      data: {
        name: 'CGV Vincom Center',
        address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
        city: 'Hà Nội',
        phone: '1900-6017'
      }
    })
    
    // Tạo 3 screens mẫu
    const screen1 = await prisma.screen.create({
      data: {
        name: 'Screen 1',
        cinemaId: sampleCinema.id,
        capacity: 120,
        rows: 10,
        seatsPerRow: 12
      }
    })
    
    const screen2 = await prisma.screen.create({
      data: {
        name: 'Screen 2',
        cinemaId: sampleCinema.id,
        capacity: 120,
        rows: 10,
        seatsPerRow: 12
      }
    })
    
    const screen3 = await prisma.screen.create({
      data: {
        name: 'Screen 3 - IMAX',
        cinemaId: sampleCinema.id,
        capacity: 120,
        rows: 10,
        seatsPerRow: 12
      }
    })
    
    screens.push(screen1, screen2, screen3)
  }
  
  console.log('🗑️ Clearing existing seats...')
  await prisma.seat.deleteMany({})
  
  for (const screen of screens) {
    await createSeatsForScreen(screen.id, `${screen.cinema.name} - ${screen.name}`)
  }
  
  const totalSeats = await prisma.seat.count()
  const seatsByType = await prisma.seat.groupBy({
    by: ['type'],
    _count: {
      type: true
    }
  })
  
  console.log('\n📊 SEAT STATISTICS:')
  console.log(`Total seats created: ${totalSeats}`)
  console.log(`Screens: ${screens.length}`)
  console.log(`Seats per screen: ${totalSeats / screens.length}`)
  
  console.log('\n🎭 SEAT TYPES:')
  seatsByType.forEach(stat => {
    console.log(`${stat.type}: ${stat._count.type} seats`)
  })
  
  console.log('\n✅ Seats generation completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
