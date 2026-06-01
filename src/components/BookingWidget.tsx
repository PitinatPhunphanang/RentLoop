"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface BookingWidgetProps {
  itemId: string
  rentalPricePerDay: number
  depositAmount: number | null
}

export default function BookingWidget({ itemId, rentalPricePerDay, depositAmount }: BookingWidgetProps) {
  const router = useRouter()

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!startDate || !endDate) {
      setError("กรุณาเลือกวันเริ่มต้นและสิ้นสุดการเช่า")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          startDateStr: startDate,
          endDateStr: endDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาดในการทำรายการ")
        setLoading(false)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard/bookings")
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 text-left">
      
      {/* Price breakdown and rate */}
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-emerald-800">อัตราค่าเช่าสินค้า</span>
        <div>
          <span className="text-2xl font-black text-emerald-600">฿{rentalPricePerDay}</span>
          <span className="text-xs text-gray-500 font-semibold"> / วัน</span>
        </div>
      </div>

      {depositAmount && (
        <div className="flex justify-between items-center text-xs border-t border-emerald-100/60 pt-3">
          <span className="font-semibold text-emerald-800">ค่ามัดจำสินค้า (ได้รับคืนหลังเช่าเสร็จ)</span>
          <span className="font-extrabold text-emerald-600">฿{depositAmount}</span>
        </div>
      )}

      {/* Alert boxes */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex items-start gap-2 text-xxs text-red-700 leading-normal mt-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex items-start gap-2 text-xxs text-emerald-700 leading-normal mt-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>ส่งคำขอจองสำเร็จ! กำลังนำคุณไปยังหน้าควบคุมระบบ...</span>
        </div>
      )}

      {/* Date Pickers */}
      <div className="flex flex-col gap-3 mt-2 border-t border-emerald-100/60 pt-4">
        <div className="grid grid-cols-2 gap-3">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">วันเริ่มต้นเช่า</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading || success}
              min={new Date().toISOString().split("T")[0]}
              className="h-9 px-3 rounded-lg border border-emerald-200/60 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">วันสิ้นสุดการเช่า</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading || success}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="h-9 px-3 rounded-lg border border-emerald-200/60 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700 disabled:opacity-50"
            />
          </div>

        </div>

        {/* Submit action */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-100 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังทำรายการส่งของ...</span>
            </>
          ) : (
            <>
              <Calendar className="h-4.5 w-4.5" />
              <span>จองเช่าสินค้าทันที</span>
            </>
          )}
        </button>
      </div>

    </form>
  )
}
