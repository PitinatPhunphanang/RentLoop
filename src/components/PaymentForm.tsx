"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { processPayment } from "@/app/actions/booking"
import { CreditCard, QrCode, ArrowLeft, ShieldCheck, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PaymentFormProps {
  booking: {
    id: string
    startDate: Date
    endDate: Date
    totalPrice: number
    deposit: number | null
    item: {
      title: string
      rentalPricePerDay: number | null
    }
  }
}

export default function PaymentForm({ booking }: PaymentFormProps) {
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState<"PROMPTPAY" | "CREDIT_CARD">("PROMPTPAY")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Card form states
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")

  const rentalTotal = booking.totalPrice
  const deposit = booking.deposit || 0
  const totalAmount = rentalTotal + deposit

  const durationDays = Math.ceil(
    Math.abs(new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (paymentMethod === "CREDIT_CARD") {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        setError("กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน")
        setLoading(false)
        return
      }
    }

    try {
      const res = await processPayment(booking.id, paymentMethod)

      if (!res.success) {
        setError(res.error || "เกิดข้อผิดพลาดในการประมวลผลการชำระเงิน")
        setLoading(false)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard/bookings")
          router.refresh()
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์")
      setLoading(false)
    }
  }

  // Format Card Number (space every 4 digits)
  const handleCardNumberChange = (value: string) => {
    const clean = value.replace(/\D/g, "")
    const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean
    setCardNumber(formatted.slice(0, 19))
  }

  // Format Expiry (MM/YY)
  const handleExpiryChange = (value: string) => {
    const clean = value.replace(/\D/g, "")
    if (clean.length > 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`)
    } else {
      setCardExpiry(clean)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
      
      {/* Left Column: Summary of Charges (Colspan 5) */}
      <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">ใบสรุปค่าบริการเช่า</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-1 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider">สินค้าที่เช่า</span>
            <span className="text-sm font-bold text-gray-800 line-clamp-1">{booking.item.title}</span>
          </div>

          <div className="flex flex-col gap-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>ค่าเช่ารายวัน (฿{booking.item.rentalPricePerDay} x {durationDays} วัน)</span>
              <span className="font-semibold text-gray-800">฿{rentalTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>เงินค่ามัดจำล่วงหน้า (ได้คืนหลังเสร็จสิ้น)</span>
              <span className="font-semibold text-gray-800">฿{deposit}</span>
            </div>
            
            <div className="h-px bg-gray-100 my-1" />

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-800">ยอดชำระสุทธิ (Total Due)</span>
              <span className="text-xl font-black text-indigo-600">฿{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100/60 p-4 flex items-start gap-2.5 text-xxs text-indigo-800 leading-relaxed">
          <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>ชำระเงินปลอดภัย 256-bit SSL:</strong> ข้อมูลการชำระเงินของคุณได้รับการเข้ารหัสความปลอดภัยระดับธนาคาร ระบบจำลองนี้ไม่ได้บันทึกรหัสบัตรจริงใดๆ ในฐานข้อมูลผู้ใช้
          </span>
        </div>
      </div>

      {/* Right Column: Interactive payment form tabs (Colspan 7) */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">เลือกช่องทางการชำระเงิน</h3>
        </div>

        {/* Tab Selector buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={() => setPaymentMethod("PROMPTPAY")}
            className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              paymentMethod === "PROMPTPAY"
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-100"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-100 hover:text-indigo-600"
            }`}
          >
            <QrCode className="h-4.5 w-4.5" />
            <span>PromptPay QR</span>
          </button>
          
          <button
            onClick={() => setPaymentMethod("CREDIT_CARD")}
            className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              paymentMethod === "CREDIT_CARD"
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-100"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-100 hover:text-indigo-600"
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            <span>บัตรเครดิต/เดบิต</span>
          </button>
        </div>

        {/* Error alerts */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 flex items-start gap-2.5 text-xs text-red-700 leading-normal">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 flex items-start gap-2.5 text-xs text-emerald-700 leading-normal">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>ชำระเงินสำเร็จแล้ว! กำลังบันทึกสถานะธุรกรรมและส่งประวัติกลับไปยังแดชบอร์ด...</span>
          </div>
        )}

        {/* Form container */}
        <form onSubmit={handlePay} className="flex flex-col gap-6">
          
          {/* A. PromptPay Layout */}
          {paymentMethod === "PROMPTPAY" && (
            <div className="flex flex-col items-center gap-6 p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
              
              {/* Header Box */}
              <div className="w-full max-w-xs bg-[#103a5c] rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-sm text-white font-extrabold text-base tracking-wide">
                <span>Prompt Pay</span>
              </div>

              {/* QR Image */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-inner relative">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=103a5c&data=rentloop_booking_${booking.id}_amount_${totalAmount}`}
                  alt="PromptPay QR Code"
                  className="h-44 w-44 object-contain"
                />
              </div>

              {/* Scanning Instructions */}
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider">ชื่อบัญชีรับเงิน</span>
                <span className="text-sm font-bold text-gray-800">RentLoop Co., Ltd. (เรนท์ลูป)</span>
                <span className="text-xxs text-gray-400 leading-relaxed max-w-xs mt-1.5">
                  เปิดแอปพลิเคชันธนาคารของคุณ สแกนคิวอาร์โค้ดด้านบนเพื่อชำระเงินจำนวน <strong>฿{totalAmount}</strong> ถ้วน
                </span>
              </div>

            </div>
          )}

          {/* B. Credit Card Layout */}
          {paymentMethod === "CREDIT_CARD" && (
            <div className="flex flex-col gap-6">
              
              {/* REALISTIC 3D CREDIT CARD MOCK */}
              <div className="w-full h-44 rounded-2xl bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-700 p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                
                <div className="flex justify-between items-start z-10">
                  <span className="text-sm font-black tracking-widest leading-none">VISA</span>
                  <div className="h-8 w-11 rounded bg-yellow-400/80 border border-yellow-300 opacity-80" /> {/* Chip */}
                </div>

                <div className="z-10 text-left">
                  <span className="text-lg font-mono tracking-[0.2em] font-medium drop-shadow-sm block">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </span>
                </div>

                <div className="flex justify-between items-end z-10 text-left">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-white/60 font-semibold leading-none">Card Holder</span>
                    <span className="text-xs font-semibold tracking-wide uppercase truncate max-w-[180px]">
                      {cardName || "YOUR FULL NAME"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-[9px] uppercase tracking-wider text-white/60 font-semibold leading-none">Expires</span>
                    <span className="text-xs font-semibold tracking-wide font-mono">
                      {cardExpiry || "MM/YY"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Inputs Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1.5 text-left col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อผู้ถือบัตร</label>
                  <input
                    type="text"
                    required={paymentMethod === "CREDIT_CARD"}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="สมชาย ใจดี"
                    disabled={loading || success}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400 font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">หมายเลขบัตรเครดิต</label>
                  <input
                    type="text"
                    required={paymentMethod === "CREDIT_CARD"}
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    disabled={loading || success}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400 font-mono tracking-wider font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">วันหมดอายุ</label>
                  <input
                    type="text"
                    required={paymentMethod === "CREDIT_CARD"}
                    value={cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                    disabled={loading || success}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400 font-mono tracking-wider font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CVV (รหัสหลังบัตร)</label>
                  <input
                    type="password"
                    required={paymentMethod === "CREDIT_CARD"}
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    placeholder="•••"
                    disabled={loading || success}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400 font-mono font-semibold"
                  />
                </div>

              </div>

            </div>
          )}

          {/* Submit action */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังประมวลผลการโอนเงิน...</span>
              </>
            ) : (
              <span>ยืนยันชำระเงินค่าเช่า ฿{totalAmount}</span>
            )}
          </button>

        </form>

      </div>

    </div>
  )
}
