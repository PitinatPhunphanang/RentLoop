import { redirect } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import BookingsDashboard from "@/components/BookingsDashboard"
import { LayoutDashboard, Sparkles } from "lucide-react"

export default async function DashboardBookingsPage() {
  const session = await auth()
  
  // Protect all dashboard routes - redirect to /login if not authenticated
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard/bookings")
  }
  const userId = session.user.id

  // 1. Fetch Outgoing Rentals (where current user is Renter)
  const outgoingRentals = await prisma.booking.findMany({
    where: {
      renterId: userId,
    },
    include: {
      item: {
        include: {
          images: true,
          community: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // 2. Fetch Incoming Requests (where items are owned by current user)
  const incomingRequests = await prisma.booking.findMany({
    where: {
      item: {
        ownerId: userId,
      },
    },
    include: {
      item: {
        include: {
          images: true,
          community: true,
        },
      },
      renter: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 bg-gray-50/50 py-8 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          
          {/* Header page title */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <h1 className="text-xl font-black text-gray-800">แผงควบคุมหลัก (Dashboard)</h1>
                <p className="text-xs text-gray-400">
                  จัดการธุรกรรมการเช่าและการจองสิ่งของทั้งหมดของคุณแบบครบวงจร
                </p>
              </div>
            </div>
          </div>

          {/* Core Dashboard UI component */}
          <BookingsDashboard 
            outgoingRentals={outgoingRentals as any} 
            incomingRequests={incomingRequests as any} 
          />

        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  )
}
