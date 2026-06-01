"use client"

import { useState } from "react"
import Link from "next/link"
import { approveBooking, rejectBooking, cancelBooking, completeBooking } from "@/app/actions/booking"
import { getConditionLabel } from "@/components/ItemCard"
import { Calendar, User, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2, XCircle, AlertCircle, ShoppingBag, Coins, HelpCircle } from "lucide-react"

// Define interfaces matching the Prisma include schemas
interface BookingWithItem {
  id: string
  itemId: string
  renterId: string
  startDate: Date
  endDate: Date
  totalPrice: number
  deposit: number | null
  status: string
  createdAt: Date
  item: {
    id: string
    title: string
    description: string
    pickupLocation: string | null
    condition: string
    rentalPricePerDay: number | null
    images: { url: string }[]
    community: { name: string } | null
  }
}

interface BookingWithItemAndRenter extends BookingWithItem {
  renter: {
    name: string | null
    email: string
    phone: string | null
    avatarUrl: string | null
  }
}

interface BookingsDashboardProps {
  outgoingRentals: BookingWithItem[]
  incomingRequests: BookingWithItemAndRenter[]
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return {
        label: "รอเจ้าของอนุมัติ",
        style: "bg-amber-50 text-amber-700 border-amber-200/50",
      }
    case "APPROVED":
      return {
        label: "อนุมัติแล้ว (รอชำระเงิน)",
        style: "bg-blue-50 text-blue-700 border-blue-200/50",
      }
    case "ONGOING":
      return {
        label: "กำลังเช่าอยู่",
        style: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
      }
    case "COMPLETED":
      return {
        label: "คืนของเสร็จสิ้น",
        style: "bg-gray-100 text-gray-600 border-gray-200/50",
      }
    case "REJECTED":
      return {
        label: "ปฏิเสธการจอง",
        style: "bg-red-50 text-red-700 border-red-200/50",
      }
    case "CANCELLED":
      return {
        label: "ยกเลิกแล้ว",
        style: "bg-gray-50 text-gray-400 border-gray-200/50",
      }
    default:
      return {
        label: status,
        style: "bg-gray-50 text-gray-600 border-gray-200/50",
      }
  }
}

export default function BookingsDashboard({ outgoingRentals, incomingRequests }: BookingsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleAction = async (id: string, actionFn: (bookingId: string) => Promise<{ success: boolean; error?: string }>) => {
    setActionError(null)
    setLoadingId(id)
    try {
      const res = await actionFn(id)
      if (!res.success) {
        setActionError(res.error || "เกิดข้อผิดพลาดในการทำรายการ")
      }
    } catch (err) {
      console.error(err)
      setActionError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
    } finally {
      setLoadingId(null)
    }
  }

  const formatThaiDate = (dateVal: Date) => {
    return new Date(dateVal).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Dynamic Action Error Banner */}
      {actionError && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-2.5 text-xs text-red-700 leading-normal animate-fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs Toggles */}
      <div className="border-b border-gray-200/80">
        <div className="flex gap-6 -mb-px">
          
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === "outgoing"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            รายการเช่าของฉัน ({outgoingRentals.length})
          </button>

          <button
            onClick={() => setActiveTab("incoming")}
            className={`pb-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === "incoming"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            รายการจองจากลูกค้า ({incomingRequests.length})
          </button>

        </div>
      </div>

      {/* Outgoing Tab: Rentals requested by current user */}
      {activeTab === "outgoing" && (
        <div className="flex flex-col gap-4">
          {outgoingRentals.length > 0 ? (
            outgoingRentals.map((b) => {
              const badge = getStatusBadge(b.status)
              const imageUrl = b.item.images?.[0]?.url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500"
              const durationDays = Math.ceil(Math.abs(new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

              return (
                <div key={b.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-gray-200 transition-all">
                  
                  {/* Left Column: Image and specifications */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={imageUrl}
                      alt={b.item.title}
                      className="h-16 w-24 object-cover rounded-xl border border-gray-100 shadow-inner shrink-0"
                    />
                    <div className="flex flex-col items-start gap-1 min-w-0">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${badge.style}`}>
                        {badge.label}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800 truncate w-full">
                        {b.item.title}
                      </h4>
                      <p className="text-xxs text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3 text-indigo-500" />
                          {formatThaiDate(b.startDate)} - {formatThaiDate(b.endDate)} ({durationDays} วัน)
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 text-indigo-500" />
                          {b.item.community?.name || b.item.pickupLocation || "ทั่วไป"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Price breakdown */}
                  <div className="flex flex-col items-start md:items-end text-left md:text-right shrink-0">
                    <span className="text-xxs font-semibold text-gray-400">ยอดรวมค่าบริการ</span>
                    <span className="text-base font-black text-indigo-600">฿{b.totalPrice}</span>
                    {b.deposit && (
                      <span className="text-xxs text-gray-400">มัดจำ ฿{b.deposit}</span>
                    )}
                  </div>

                  {/* Right Column: Interaction Action buttons */}
                  <div className="flex items-center gap-2 w-full md:w-auto md:shrink-0 justify-end pt-4 md:pt-0 border-t border-gray-50 md:border-t-0">
                    {/* renter can cancel PENDING */}
                    {b.status === "PENDING" && (
                      <button
                        onClick={() => handleAction(b.id, cancelBooking)}
                        disabled={loadingId === b.id}
                        className="h-9 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs disabled:opacity-50 transition-all"
                      >
                        {loadingId === b.id ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
                      </button>
                    )}

                    {/* renter pays APPROVED */}
                    {b.status === "APPROVED" && (
                      <Link
                        href={`/dashboard/bookings/pay/${b.id}`}
                        className="h-9 px-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100 hover:opacity-95 transition-all"
                      >
                        <Coins className="h-3.5 w-3.5 mr-1" />
                        <span>ชำระเงิน</span>
                      </Link>
                    )}

                    {b.status === "ONGOING" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                        <Clock className="h-3.5 w-3.5" />
                        <span>กำลังใช้บริการสินค้า</span>
                      </div>
                    )}

                    {b.status === "COMPLETED" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-150">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>คืนของเรียบร้อย</span>
                      </div>
                    )}
                  </div>

                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-gray-200 bg-white gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-gray-500">คุณยังไม่มีประวัติการเช่าสินค้าใดๆ</p>
              <Link
                href="/items"
                className="inline-flex h-9 px-5 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                เริ่มหาของเพื่อเช่า
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Incoming Tab: Bookings requested on items owned by current user */}
      {activeTab === "incoming" && (
        <div className="flex flex-col gap-4">
          {incomingRequests.length > 0 ? (
            incomingRequests.map((b) => {
              const badge = getStatusBadge(b.status)
              const imageUrl = b.item.images?.[0]?.url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500"
              const durationDays = Math.ceil(Math.abs(new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

              return (
                <div key={b.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-gray-200 transition-all">
                  
                  {/* Left Column: Image, details, and customer info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 min-w-0 w-full">
                    <img
                      src={imageUrl}
                      alt={b.item.title}
                      className="h-16 w-24 object-cover rounded-xl border border-gray-100 shadow-inner shrink-0"
                    />
                    <div className="flex flex-col items-start gap-1 min-w-0 w-full">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${badge.style}`}>
                        {badge.label}
                      </span>
                      <h4 className="text-sm font-bold text-gray-800 truncate w-full">
                        {b.item.title}
                      </h4>
                      <p className="text-xxs text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3 text-indigo-500" />
                          {formatThaiDate(b.startDate)} - {formatThaiDate(b.endDate)} ({durationDays} วัน)
                        </span>
                        <span className="flex items-center gap-0.5">
                          <User className="h-3 w-3 text-indigo-500" />
                          ผู้จอง: {b.renter?.name || "ไม่ระบุชื่อ"} ({b.renter?.phone || "ไม่มีเบอร์"})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Rent andมัดจำ */}
                  <div className="flex flex-col items-start md:items-end text-left md:text-right shrink-0">
                    <span className="text-xxs font-semibold text-gray-400">รายได้รวมของคุณ</span>
                    <span className="text-base font-black text-indigo-600">฿{b.totalPrice}</span>
                    {b.deposit && (
                      <span className="text-xxs text-gray-400">มัดจำคืนลูกค้า ฿{b.deposit}</span>
                    )}
                  </div>

                  {/* Right Column: Interaction Action buttons */}
                  <div className="flex items-center gap-2 w-full md:w-auto md:shrink-0 justify-end pt-4 md:pt-0 border-t border-gray-50 md:border-t-0">
                    {/* Owner approves/rejects PENDING */}
                    {b.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAction(b.id, rejectBooking)}
                          disabled={loadingId === b.id}
                          className="h-9 px-4 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold text-xs disabled:opacity-50 transition-all animate-fade-in"
                        >
                          ปฏิเสธ
                        </button>
                        <button
                          onClick={() => handleAction(b.id, approveBooking)}
                          disabled={loadingId === b.id}
                          className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-1 animate-fade-in"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>อนุมัติ</span>
                        </button>
                      </>
                    )}

                    {/* Owner completes ONGOING */}
                    {b.status === "ONGOING" && (
                      <button
                        onClick={() => handleAction(b.id, completeBooking)}
                        disabled={loadingId === b.id}
                        className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 disabled:opacity-50 transition-all flex items-center gap-1 animate-fade-in"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>เสร็จสิ้นการเช่า (คืนของ)</span>
                      </button>
                    )}

                    {b.status === "APPROVED" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        <span>รอลูกค้าชำระเงิน</span>
                      </div>
                    )}

                    {b.status === "COMPLETED" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-150">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>เสร็จสิ้นรายการ</span>
                      </div>
                    )}

                    {b.status === "REJECTED" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>คุณปฏิเสธแล้ว</span>
                      </div>
                    )}

                    {b.status === "CANCELLED" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>ลูกค้าเลิกรายการ</span>
                      </div>
                    )}
                  </div>

                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-gray-200 bg-white gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <HelpCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-gray-500">ยังไม่มีรายการจองเช่าเข้ามหาแบรนด์สินค้าของคุณ</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
