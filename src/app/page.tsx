import prisma from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ItemCard from "@/components/ItemCard"
import CategoryFilter from "@/components/CategoryFilter"
import Link from "next/link"
import { ArrowRight, Sparkles, Shield, HeartHandshake, Zap } from "lucide-react"

export default async function Home() {
  // Fetch categories and latest items from real PostgreSQL database using Prisma
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  const latestItems = await prisma.item.findMany({
    where: {
      status: "AVAILABLE",
      deletedAt: null,
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      images: true,
      community: true,
    },
  })

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header Navigation */}
      <Navbar />

      <main className="flex-1 bg-gray-50/50">
        
        {/* Premium Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 py-20 text-white">
          
          {/* Subtle glowing elements */}
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Copywriting */}
              <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>แพลตฟอร์มแบ่งปันสินค้าอันดับ 1 ในชุมชน</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                  เช่า หรือ ซื้อขายสิ่งของ<br />
                  <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    ภายในชุมชนของคุณ
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-indigo-200/80 leading-relaxed max-w-xl">
                  หมดปัญหากับของที่ใช้แค่ครั้งเดียวแล้วตั้งทิ้งไว้! ร่วมเป็นส่วนหนึ่งในการแบ่งปัน ประหยัดเงิน และรักษาสิ่งแวดล้อมโดยการเช่าของจากเพื่อนบ้านในคอนโดหรือมหาวิทยาลัยเดียวกัน
                </p>

                <div className="flex flex-wrap gap-4 mt-2">
                  <Link
                    href="/items"
                    className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold bg-white text-indigo-950 hover:bg-gray-100 shadow-lg shadow-indigo-950/20 transition-all hover:scale-[1.02]"
                  >
                    <span>เริ่มสำรวจสินค้า</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 h-12 px-6 rounded-xl font-bold bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-500/30 text-white transition-all"
                  >
                    <span>สมัครสมาชิกใหม่</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Mockup */}
              <div className="lg:col-span-5 hidden lg:block">
                <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-2xl">
                  <div className="absolute -top-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-lg animate-pulse">
                    <Zap className="h-6 w-6" />
                  </div>
                  
                  {/* Visual list snippet */}
                  <div className="flex flex-col gap-4 text-left">
                    <div className="text-xs font-bold text-indigo-300 tracking-wider uppercase">การทำธุรกรรมล่าสุด</div>
                    
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="h-11 w-11 rounded-xl bg-purple-500/20 flex items-center justify-center font-bold text-purple-300">PS</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">PlayStation 5 (Disc Edition)</div>
                        <div className="text-xs text-indigo-200/60">ถูกเช่าโดย John Smith ที่ CU I-House</div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">เช่าแล้ว</span>
                    </div>

                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="h-11 w-11 rounded-xl bg-blue-500/20 flex items-center justify-center font-bold text-blue-300">SB</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">Sofa Bed 3-Seater Gray</div>
                        <div className="text-xs text-indigo-200/60">ลงขายโดย Somchai Dev ที่ Ideo Mobi</div>
                      </div>
                      <span className="text-xs font-bold text-blue-400">กำลังขาย</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Dynamic Categories Row */}
        <section className="bg-white border-b border-gray-100 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-3">
            <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest text-left">
              หมวดหมู่ยอดนิยม
            </h2>
            <CategoryFilter categories={categories} />
          </div>
        </section>

        {/* Features Pitch Section */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-12">
            <div className="flex flex-col gap-2 max-w-xl mx-auto">
              <h2 className="text-2xl font-extrabold text-gray-800">ทำไมต้องใช้งาน RentLoop?</h2>
              <p className="text-sm text-gray-500 leading-relaxed">แพลตฟอร์มที่เชื่อมโยงคุณและเพื่อนบ้านเข้าหากันอย่างปลอดภัยและเป็นมิตร</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="flex flex-col items-center p-6 rounded-2xl border border-gray-100 bg-gray-50/30 gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-800">ปลอดภัย เชื่อถือได้</h3>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  ยืนยันตัวตนผู้ใช้ และคัดกรองสมาชิกภายในคอนโด มหาวิทยาลัย หรือชุมชนเดียวกันเพื่อความอุ่นใจสูงสุดในการนัดรับ
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-2xl border border-gray-100 bg-gray-50/30 gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-800">รักษ์โลก ประหยัดเงิน</h3>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  ลดปริมาณการผลิตขยะโดยใช้ร่วมกัน ประหยัดเงินค่าซื้อของใหม่ที่นานๆ จะใช้ที และเปลี่ยนของเหลือใช้ให้เป็นรายได้
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-2xl border border-gray-100 bg-gray-50/30 gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-800">นัดรับสะดวก รวดเร็ว</h3>
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  ไม่ต้องรอคิวส่งพัสดุ เพราะสามารถนัดเจอกันที่ล็อบบี้ใต้ตึกหรือลานกิจกรรมในสถาบันของคุณได้โดยตรงในไม่กี่นาที
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Latest Listings Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="flex items-end justify-between border-b border-gray-100 pb-4">
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-2xl font-black text-gray-800">สินค้ามาใหม่ล่าสุด</h2>
                <p className="text-xs text-gray-400">ประกาศใหม่ล่าสุดที่พร้อมนัดรับในชุมชนวันนี้</p>
              </div>
              <Link 
                href="/items" 
                className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {latestItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {latestItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-gray-200 bg-white gap-4">
                <p className="text-sm font-medium text-gray-500">ยังไม่มีสินค้าประกาศลงระบบในขณะนี้</p>
                <Link
                  href="/login"
                  className="inline-flex h-10 px-6 items-center justify-center rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 transition-colors"
                >
                  ลงประกาศสินค้าชิ้นแรก
                </Link>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <Footer />

    </div>
  )
}
