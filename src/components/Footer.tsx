import { Infinity, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Infinity className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-800">
                RentLoop
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              แพลตฟอร์มเพื่อการแบ่งปันสิ่งของและเช่าสินค้าสำหรับทุกคนในชุมชน ส่งเสริมการประหยัดค่าใช้จ่าย ช่วยกันใช้ทรัพยากรให้คุ้มค่าที่สุด และสร้างสัมพันธ์ที่ดีในเพื่อนบ้าน
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">สำรวจ</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              <li><a href="/items" className="hover:text-indigo-600 transition-colors">สินค้าทั้งหมด</a></li>
              <li><a href="/items?type=RENTAL" className="hover:text-indigo-600 transition-colors">สำหรับเช่าเท่านั้น</a></li>
              <li><a href="/items?type=SALE" className="hover:text-indigo-600 transition-colors">สำหรับซื้อขายเท่านั้น</a></li>
            </ul>
          </div>

          {/* Support Info */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">ช่วยเหลือ</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              <li><a href="/login" className="hover:text-indigo-600 transition-colors">เข้าสู่ระบบ</a></li>
              <li><a href="/register" className="hover:text-indigo-600 transition-colors">สมัครสมาชิก</a></li>
              <li><span className="text-gray-400">ติดต่อฝ่ายดูแลระบบ</span></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} RentLoop Inc. สงวนลิขสิทธิ์ทั้งหมด
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            สร้างขึ้นด้วยความใส่ใจ <Heart className="h-3 w-3 text-red-400 fill-red-400" /> เพื่อชุมชนของเรา
          </p>
        </div>
      </div>
    </footer>
  )
}
