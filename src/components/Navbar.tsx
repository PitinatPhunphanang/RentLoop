import Link from "next/link"
import { auth } from "@/auth"
import { handleSignOut } from "@/app/actions/auth"
import { Search, LogIn, UserPlus, LogOut, Infinity, ShoppingBag } from "lucide-react"

export default async function Navbar() {
  const session = await auth()
  const user = session?.user

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
                <Infinity className="h-6 w-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                RentLoop
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <form action="/items" method="GET" className="relative group">
              <input
                type="text"
                name="search"
                placeholder="ค้นหาสินค้าเพื่อซื้อหรือเช่า..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </form>
          </div>

          {/* Action Links & User Menu */}
          <div className="flex items-center gap-4">
            <Link 
              href="/items" 
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>สินค้าทั้งหมด</span>
            </Link>

            <div className="h-4 w-px bg-gray-200" />

            {user ? (
              <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full border border-indigo-100 shadow-sm object-cover"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-800 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {user.role === "ADMIN" ? "ผู้ดูแลระบบ" : "สมาชิก"}
                    </span>
                  </div>
                </div>

                {/* Sign Out Form */}
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all border border-gray-100 hover:border-gray-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-100 hover:opacity-95 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>สมัครสมาชิก</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
