-- CreateTable
CREATE TABLE "Seat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "screenId" INTEGER NOT NULL,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Seat_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "Screen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingSeat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "seatId" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "BookingSeat_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookingSeat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "showtimeId" INTEGER NOT NULL,
    "seats" TEXT NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bookingCode" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("bookingCode", "createdAt", "id", "seats", "showtimeId", "status", "totalPrice", "userId") SELECT "bookingCode", "createdAt", "id", "seats", "showtimeId", "status", "totalPrice", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_bookingCode_key" ON "Booking"("bookingCode");
CREATE TABLE "new_Screen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cinemaId" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "rows" INTEGER NOT NULL DEFAULT 10,
    "seatsPerRow" INTEGER NOT NULL DEFAULT 12,
    CONSTRAINT "Screen_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Screen" ("capacity", "cinemaId", "id", "name") SELECT "capacity", "cinemaId", "id", "name" FROM "Screen";
DROP TABLE "Screen";
ALTER TABLE "new_Screen" RENAME TO "Screen";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Seat_screenId_row_number_key" ON "Seat"("screenId", "row", "number");

-- CreateIndex
CREATE UNIQUE INDEX "BookingSeat_bookingId_seatId_key" ON "BookingSeat"("bookingId", "seatId");
