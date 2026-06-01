"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// 1. Owner Approves Booking
export async function approveBooking(bookingId: string) {
  const session = await auth()
  if (!session || !session.user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }
  }
  const userId = session.user.id

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { item: true },
    })

    if (!booking) {
      return { success: false, error: "ไม่พบรายการจองดังกล่าวในระบบ" }
    }

    if (booking.item.ownerId !== userId) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการอนุมัติรายการนี้" }
    }

    if (booking.status !== "PENDING") {
      return { success: false, error: "รายการนี้ไม่ได้อยู่ในสถานะรอการอนุมัติ" }
    }

    // Double-check date conflicts at approval time just in case of race conditions
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: bookingId },
        itemId: booking.itemId,
        status: { in: ["APPROVED", "ONGOING"] },
        startDate: { lte: booking.endDate },
        endDate: { gte: booking.startDate },
      },
    })

    if (conflict) {
      return {
        success: false,
        error: "ขออภัย ช่วงเวลานี้มีการอนุมัติรายการเช่าชิ้นอื่นไปแล้ว ไม่สามารถอนุมัติซ้ำได้",
      }
    }

    // Update Booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "APPROVED" },
    })

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Approve Booking Error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการทำรายการ" }
  }
}

// 2. Owner Rejects Booking
export async function rejectBooking(bookingId: string) {
  const session = await auth()
  if (!session || !session.user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }
  }
  const userId = session.user.id

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { item: true },
    })

    if (!booking) {
      return { success: false, error: "ไม่พบรายการจองดังกล่าวในระบบ" }
    }

    if (booking.item.ownerId !== userId) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการปฏิเสธรายการนี้" }
    }

    if (booking.status !== "PENDING") {
      return { success: false, error: "ไม่สามารถปฏิเสธรายการที่พ้นสถานะรอการอนุมัติได้" }
    }

    // Update Booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "REJECTED" },
    })

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Reject Booking Error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการทำรายการ" }
  }
}

// 3. Renter Cancels Booking
export async function cancelBooking(bookingId: string) {
  const session = await auth()
  if (!session || !session.user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }
  }
  const userId = session.user.id

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return { success: false, error: "ไม่พบรายการจองดังกล่าวในระบบ" }
    }

    if (booking.renterId !== userId) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการยกเลิกรายการนี้" }
    }

    if (booking.status !== "PENDING") {
      return { success: false, error: "สามารถยกเลิกได้เฉพาะรายการที่อยู่ในสถานะรออนุมัติเท่านั้น" }
    }

    // Update Booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    })

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Cancel Booking Error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการทำรายการ" }
  }
}

// 4. Owner Completes Booking
export async function completeBooking(bookingId: string) {
  const session = await auth()
  if (!session || !session.user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }
  }
  const userId = session.user.id

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { item: true },
    })

    if (!booking) {
      return { success: false, error: "ไม่พบรายการจองดังกล่าวในระบบ" }
    }

    if (booking.item.ownerId !== userId) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการปิดรายการนี้" }
    }

    if (booking.status !== "ONGOING") {
      return { success: false, error: "รายการเช่านี้ต้องอยู่ในสถานะกำลังดำเนินงานจึงจะกดสิ้นสุดได้" }
    }

    // Transaction updates: Booking to COMPLETED, Item back to AVAILABLE
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      }),
      prisma.item.update({
        where: { id: booking.itemId },
        data: { status: "AVAILABLE" },
      }),
    ])

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Complete Booking Error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการทำรายการ" }
  }
}

// 5. Renter Processes Payment (transition from APPROVED to ONGOING)
export async function processPayment(bookingId: string, method: string) {
  const session = await auth()
  if (!session || !session.user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" }
  }
  const userId = session.user.id

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { item: true },
    })

    if (!booking) {
      return { success: false, error: "ไม่พบรายการจองดังกล่าวในระบบ" }
    }

    if (booking.renterId !== userId) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการชำระเงินสำหรับรายการนี้" }
    }

    if (booking.status !== "APPROVED") {
      return { success: false, error: "รายการจองนี้ไม่พร้อมสำหรับทำรายการชำระเงิน" }
    }

    const totalAmount = booking.totalPrice + (booking.deposit || 0)

    // Execute in transaction: Update Booking to ONGOING, Update Item to RENTED, and create Payment record
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "ONGOING" },
      }),
      prisma.item.update({
        where: { id: booking.itemId },
        data: { status: "RENTED" },
      }),
      prisma.payment.create({
        data: {
          bookingId,
          amount: totalAmount,
          status: "COMPLETED",
          method: method,
        },
      }),
    ])

    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Process Payment Error:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการประมวลผลการชำระเงิน" }
  }
}

