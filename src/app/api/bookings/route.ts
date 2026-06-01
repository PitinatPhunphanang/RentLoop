import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const { itemId, startDateStr, endDateStr } = await req.json()
    if (!itemId || !startDateStr || !endDateStr) {
      return NextResponse.json({ error: "กรุณาระบุข้อมูลและวันที่ให้ครบถ้วน" }, { status: 400 })
    }

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    // Reset times to midnight for precise date calculations
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "วันที่คุณเลือกไม่ถูกต้อง" }, { status: 400 })
    }

    if (startDate < today) {
      return NextResponse.json({ error: "วันที่เริ่มเช่าต้องไม่ผ่านไปแล้ว" }, { status: 400 })
    }

    if (startDate > endDate) {
      return NextResponse.json({ error: "วันที่เริ่มเช่าต้องไม่เกินวันสิ้นสุดการเช่า" }, { status: 400 })
    }

    // Fetch Item details
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item || item.deletedAt) {
      return NextResponse.json({ error: "ไม่พบสินค้าที่ต้องการจองในระบบ" }, { status: 404 })
    }

    if (item.status === "UNAVAILABLE" || item.status === "SOLD") {
      return NextResponse.json({ error: "สินค้าชิ้นนี้ไม่พร้อมสำหรับทำรายการจองในขณะนี้" }, { status: 400 })
    }

    if (item.type !== "RENTAL" && item.type !== "BOTH") {
      return NextResponse.json({ error: "สินค้านี้ไม่ได้อยู่ในประเภทบริการสำหรับเช่า" }, { status: 400 })
    }

    if (item.ownerId === userId) {
      return NextResponse.json({ error: "ขออภัย คุณไม่สามารถจองเช่าสินค้าของตนเองได้" }, { status: 400 })
    }

    // Overlap Conflict validation check
    // Overlapping condition: requestedStartDate <= existingEndDate && requestedEndDate >= existingStartDate
    const conflict = await prisma.booking.findFirst({
      where: {
        itemId,
        status: { in: ["APPROVED", "ONGOING"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    })

    if (conflict) {
      return NextResponse.json(
        { error: "สินค้านี้มีผู้เช่าท่านอื่นจองในช่วงเวลาดังกล่าวแล้ว กรุณาปรับเปลี่ยนวันที่จองใหม่" },
        { status: 400 }
      )
    }

    // Price day difference calculations
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // inclusive count (e.g. June 5 to June 5 is 1 day)

    if (!item.rentalPricePerDay) {
      return NextResponse.json({ error: "สินค้าชิ้นนี้ไม่ได้ระบุอัตราค่าเช่าต่อวัน" }, { status: 400 })
    }

    const totalPrice = item.rentalPricePerDay * diffDays

    // Create the booking in PENDING state
    const booking = await prisma.booking.create({
      data: {
        itemId,
        renterId: userId,
        startDate,
        endDate,
        totalPrice,
        deposit: item.depositAmount,
        status: "PENDING",
      },
    })

    return NextResponse.json({ success: true, bookingId: booking.id })
  } catch (error) {
    console.error("Booking Creation API Error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดทางเทคนิคภายในเซิร์ฟเวอร์" }, { status: 500 })
  }
}
