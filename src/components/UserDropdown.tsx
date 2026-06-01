"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { handleSignOut } from "@/app/actions/auth"
import { LayoutDashboard, Package, User as UserIcon, LogOut, ChevronDown } from "lucide-react"

interface UserDropdownProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
    role: string
  }
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen((prev) => !prev)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Toggler Trigger button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left"
        aria-expanded={isOpen}
      >
        <img
          src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
          alt={user.name || "User"}
          className="h-8 w-8 rounded-full border border-indigo-100 shadow-sm object-cover shrink-0"
        />
        <div className="hidden sm:flex flex-col select-none pr-1">
          <span className="text-sm font-semibold text-gray-800 leading-tight">
            {user.name}
          </span>
          <span className="text-[10px] font-medium text-gray-400">
            {user.role === "ADMIN" ? "ผู้ดูแลระบบ" : "สมาชิก"}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Dropdown Box Container */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-fade-in origin-top-right">
          
          {/* User profile details header */}
          <div className="px-3.5 py-3 border-b border-gray-50 flex flex-col items-start gap-0.5 text-left">
            <span className="text-xs font-black text-gray-800">{user.name}</span>
            <span className="text-[10px] text-gray-400 truncate w-full">{user.email}</span>
          </div>

          {/* Action Menu List Links */}
          <div className="flex flex-col gap-1 py-1.5">
            
            <Link
              href="/dashboard/bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/40 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-indigo-500" />
              <span>แผงควบคุม</span>
            </Link>

            <Link
              href="/dashboard/items"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/40 transition-colors"
            >
              <Package className="h-4 w-4 text-indigo-500" />
              <span>สินค้าของฉัน</span>
            </Link>

            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/40 transition-colors"
            >
              <UserIcon className="h-4 w-4 text-indigo-500" />
              <span>โปรไฟล์</span>
            </Link>

          </div>

          {/* Teardown session form action */}
          <div className="border-t border-gray-50 pt-1.5">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>ออกจากระบบ</span>
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  )
}
