import prisma from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { notFound } from "next/navigation"
import { getConditionLabel as getCondLabel } from "@/components/ItemCard"
import { MapPin, Phone, Mail, Calendar, Sparkles, Shield, User, Info, ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface ItemDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params

  // Fetch full item details from real PostgreSQL database using Prisma
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      images: true,
      category: true,
      community: true,
      owner: {
        include: {
          community: true,
        },
      },
    },
  })

  // 404 if item does not exist
  if (!item || item.deletedAt) {
    notFound()
  }

  const imageUrl = item.images?.[0]?.url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800"

  // Type Badges Config
  let typeConfig = {
    label: "ขายขาด (Sale)",
    style: "bg-blue-50 text-blue-700 border-blue-200/50",
  }

  if (item.type === "RENTAL") {
    typeConfig = {
      label: "ให้เช่า (Rental)",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    }
  } else if (item.type === "BOTH") {
    typeConfig = {
      label: "ให้เช่า & ขายขาด (Rent/Buy)",
      style: "bg-purple-50 text-purple-700 border-purple-200/50",
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 bg-gray-50/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          
          {/* Back button */}
          <div className="flex items-start">
            <Link
              href="/items"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ย้อนกลับไปหน้าสำรวจ</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Media & Description (Colspan 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Main Card */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 text-left">
                
                {/* Image Display */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Meta details & title */}
                <div className="flex flex-col items-start gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-extrabold shadow-sm ${typeConfig.style}`}>
                      {typeConfig.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
                      <Sparkles className="h-3 w-3 stroke-[2.5]" />
                      {getCondLabel(item.condition)}
                    </span>
                    <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-extrabold text-gray-500 shadow-sm">
                      {item.category.name}
                    </span>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-gray-800 leading-tight">
                    {item.title}
                  </h1>
                </div>

                {/* Section: Description */}
                <div className="border-t border-gray-50 pt-6 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">รายละเอียดสินค้า</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>

                {/* Section: Location & Community info */}
                <div className="border-t border-gray-50 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start leading-normal">
                      <span className="font-bold text-gray-700">สถานที่นัดรับของ</span>
                      <span className="text-gray-400">{item.pickupLocation || "ระบุด้านล่าง"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start leading-normal">
                      <span className="font-bold text-gray-700">พื้นที่ชุมชนที่ผูกไว้</span>
                      <span className="text-gray-400">{item.community?.name || "สาธารณะ"}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Transaction Options & Owner Details (Colspan 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              
              {/* Transaction Widget */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">ตัวเลือกการสั่งซื้อ</h3>
                
                {/* 1. If it's a rental / both */}
                {(item.type === "RENTAL" || item.type === "BOTH") && (
                  <div className="flex flex-col gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-emerald-800">อัตราค่าเช่าสินค้า</span>
                      <div>
                        <span className="text-2xl font-black text-emerald-600">฿{item.rentalPricePerDay}</span>
                        <span className="text-xs text-gray-500 font-semibold"> / วัน</span>
                      </div>
                    </div>

                    {item.depositAmount && (
                      <div className="flex justify-between items-center text-xs border-t border-emerald-100/60 pt-3">
                        <span className="font-semibold text-emerald-800">ค่ามัดจำสินค้า (ได้รับคืนหลังเช่าเสร็จ)</span>
                        <span className="font-extrabold text-emerald-600">฿{item.depositAmount}</span>
                      </div>
                    )}

                    {/* Booking Dates Inputs */}
                    <div className="flex flex-col gap-3 mt-2 border-t border-emerald-100/60 pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">วันเริ่มต้น</label>
                          <input
                            type="date"
                            className="h-9 px-3 rounded-lg border border-emerald-200/60 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">วันสิ้นสุด</label>
                          <input
                            type="date"
                            className="h-9 px-3 rounded-lg border border-emerald-200/60 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-700"
                          />
                        </div>
                      </div>

                      <button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-100 transition-colors flex items-center justify-center gap-2 mt-2">
                        <Calendar className="h-4.5 w-4.5" />
                        <span>จองเช่าสินค้าทันที</span>
                      </button>
                    </div>

                  </div>
                )}

                {/* 2. Divider if Both */}
                {item.type === "BOTH" && (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100" />
                    </div>
                    <span className="relative bg-white px-3.5 text-xxs font-extrabold text-gray-400 uppercase tracking-widest">หรือ</span>
                  </div>
                )}

                {/* 3. If it's sale / both */}
                {(item.type === "SALE" || item.type === "BOTH") && (
                  <div className="flex flex-col gap-4 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-blue-800">ราคาขายขาด</span>
                      <span className="text-2xl font-black text-blue-600">฿{item.price}</span>
                    </div>

                    <button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-100 transition-colors flex items-center justify-center gap-2">
                      <ShoppingBag className="h-4.5 w-4.5" />
                      <span>ส่งคำขอซื้อสินค้า</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Owner Info Card */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">ผู้ลงประกาศ</h3>
                
                {/* Avatar and Name */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.owner.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
                    alt={item.owner.name || "Owner"}
                    className="h-12 w-12 rounded-full border border-indigo-100 shadow-sm object-cover"
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-base font-bold text-gray-800">{item.owner.name}</span>
                    <span className="text-xs font-semibold text-gray-400 mt-0.5">
                      สังกัดชุมชน: {item.owner.community?.name || "ไม่ได้ระบุ"}
                    </span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="border-t border-gray-50 pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-gray-600">{item.owner.phone || "ไม่ระบุเบอร์โทรศัพท์"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-gray-600">{item.owner.email}</span>
                  </div>
                </div>

                {/* Security advisory */}
                <div className="rounded-2xl bg-amber-50/50 border border-amber-100/60 p-3.5 flex items-start gap-2.5 text-xxs text-amber-800 leading-relaxed">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>ข้อแนะนำความปลอดภัย:</strong> แนะนำให้นัดพบคู่สัญญาในจุดอับหรือพื้นที่สาธารณะใต้ตึกคอนโด หรือหน่วยบริการภายในมหาวิทยาลัยที่มีผู้คนสัญจรผ่านไปมาเพื่อความปลอดภัย
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  )
}
