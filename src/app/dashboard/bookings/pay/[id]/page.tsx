import { redirect } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import PaymentForm from "@/components/PaymentForm"
import { Coins, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PaymentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const session = await auth()
  
  // Protect all dashboard routes - redirect to /login if not authenticated
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/bookings")
  }
  const userId = session.user.id

  const { id } = await params

  // Fetch booking details
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      item: true,
      renter: true,
    },
  })

  // Validate booking exists, belongs to user, and is in APPROVED state
  if (!booking) {
    redirect("/dashboard/bookings")
  }

  if (booking.renterId !== userId) {
    redirect("/dashboard/bookings")
  }

  if (booking.status !== "APPROVED") {
    redirect("/dashboard/bookings")
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 bg-gray-50/50 py-8 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          
          {/* Back button */}
          <div className="flex items-start">
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ย้อนกลับไปแผงควบคุม</span>
            </Link>
          </div>

          {/* Page Title */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Coins className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <h1 className="text-xl font-black text-gray-800">ชำระเงินค่าบริการ</h1>
                <p className="text-xs text-gray-400">
                  สแกน PromptPay QR หรือกรอกบัตรเครดิตเพื่อเริ่มใช้สิทธิ์เช่าสินค้า
                </p>
              </div>
            </div>
          </div>

          {/* Interactive payment form wrapper */}
          <PaymentForm booking={booking as any} />

        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  )
}
