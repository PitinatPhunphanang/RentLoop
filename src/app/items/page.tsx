import prisma from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ItemCard from "@/components/ItemCard"
import CategoryFilter from "@/components/CategoryFilter"
import Link from "next/link"
import { Search, Filter, RefreshCw, AlertCircle, Coins, Heart, ShoppingBag } from "lucide-react"

interface ItemsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    type?: string
    condition?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  // Await searchParams in Next.js 14+ / 15 if required
  const params = await searchParams
  
  const search = params.search || ""
  const category = params.category || ""
  const type = params.type || ""
  const condition = params.condition || ""
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined

  // 1. Fetch categories for filters
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  // 2. Fetch communities for listing context
  const communities = await prisma.community.findMany({
    orderBy: { name: "asc" },
  })

  // 3. Build dynamic query for active listings
  const where: any = {
    status: "AVAILABLE",
    deletedAt: null,
  }

  // Text search filter (case insensitive in Postgres)
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  // Category filter
  if (category) {
    where.category = { name: category }
  }

  // Transaction type filter (SALE, RENTAL, BOTH)
  if (type) {
    where.type = type
  }

  // Condition filter
  if (condition) {
    where.condition = condition
  }

  // Price range filter (checking either price or rentalPricePerDay based on item type)
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND = []
    
    if (minPrice !== undefined) {
      where.AND.push({
        OR: [
          { price: { gte: minPrice } },
          { rentalPricePerDay: { gte: minPrice } }
        ]
      })
    }

    if (maxPrice !== undefined) {
      where.AND.push({
        OR: [
          { price: { lte: maxPrice } },
          { rentalPricePerDay: { lte: maxPrice } }
        ]
      })
    }
  }

  // Execute Prisma query
  const items = await prisma.item.findMany({
    where,
    include: {
      images: true,
      community: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Navbar */}
      <Navbar />

      <main className="flex-1 bg-gray-50/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Top Category Scroller */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-8">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-left mb-2">ค้นหาตามหมวดหมู่</h2>
            <CategoryFilter categories={categories} activeCategory={category} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Left Sidebar Filter Form */}
            <aside className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-4.5 w-4.5 text-indigo-600" />
                  <span className="font-bold text-gray-800 text-base">ตัวกรองสินค้า</span>
                </div>
                <Link
                  href="/items"
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>ล้างตัวกรอง</span>
                </Link>
              </div>

              <form action="/items" method="GET" className="flex flex-col gap-6 text-left">
                {/* Preserve active category if user searches/filters */}
                {category && <input type="hidden" name="category" value={category} />}

                {/* Keyword Search */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ค้นหาคำสำคัญ</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      defaultValue={search}
                      placeholder="เช่น กล้อง, เก้าอี้..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-400"
                    />
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  </div>
                </div>

                {/* Deal Type Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">รูปแบบประกาศ</label>
                  <select
                    name="type"
                    defaultValue={type}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 transition-all text-gray-700 bg-white"
                  >
                    <option value="">ทั้งหมด (เช่าและซื้อขาย)</option>
                    <option value="RENTAL">เฉพาะให้เช่า เท่านั้น</option>
                    <option value="SALE">เฉพาะซื้อขาด เท่านั้น</option>
                    <option value="BOTH">ทำได้ทั้งเช่าและซื้อขาด</option>
                  </select>
                </div>

                {/* Condition Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">สภาพสินค้า</label>
                  <select
                    name="condition"
                    defaultValue={condition}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 transition-all text-gray-700 bg-white"
                  >
                    <option value="">ทุกสภาพสินค้า</option>
                    <option value="NEW">ของใหม่ (New)</option>
                    <option value="LIKE_NEW">เหมือนใหม่ (Like New)</option>
                    <option value="GOOD">สภาพดี (Good)</option>
                    <option value="FAIR">สภาพใช้แล้ว (Fair)</option>
                    <option value="POOR">มีรอยตำหนิ (Poor)</option>
                  </select>
                </div>

                {/* Price Range Filters */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">งบประมาณ (บาท)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      defaultValue={params.minPrice || ""}
                      placeholder="ต่ำสุด"
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-400"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      defaultValue={params.maxPrice || ""}
                      placeholder="สูงสุด"
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Submit Filters Button */}
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100 flex items-center justify-center gap-2 mt-2"
                >
                  <Filter className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>ประยุกต์ใช้ตัวกรอง</span>
                </button>
              </form>
            </aside>

            {/* Right Column: Grid listings */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Header result info */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
                <div className="flex flex-col items-start gap-0.5">
                  <h1 className="text-xl font-black text-gray-800">สำรวจสินค้าในชุมชน</h1>
                  <p className="text-xs text-gray-400">
                    {category ? `หมวดหมู่ "${category}" • ` : ""} พบประกาศทั้งหมด {items.length} รายการ
                  </p>
                </div>
              </div>

              {/* Items Cards Grid */}
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl border border-dashed border-gray-200 bg-white gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <h3 className="text-sm font-bold text-gray-800">ไม่พบสินค้าที่ตรงตามเงื่อนไข</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      ลองค้นหาคำใหม่ เปลี่ยนช่วงราคา เลือกหมวดหมู่อื่น หรือล้างตัวกรองเพื่อสำรวจรายการสิ่งของอื่นๆ ของระบบ
                    </p>
                  </div>
                  <Link
                    href="/items"
                    className="inline-flex h-10 px-5 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 font-bold text-xs transition-colors"
                  >
                    ล้างตัวกรองทั้งหมด
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

    </div>
  )
}
