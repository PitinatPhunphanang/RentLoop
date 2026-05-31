"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Infinity, LogIn, Lock, Mail, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน")
      setLoading(false)
      return
    }

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง")
        setLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header section with brand logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-100 transition-transform group-hover:scale-105">
              <Infinity className="h-7 w-7 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              RentLoop
            </span>
          </Link>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-800">
            เข้าสู่ระบบบัญชีของคุณ
          </h2>
          <p className="text-xs text-gray-400">
            ป้อนรายละเอียดข้อมูลของคุณด้านล่างเพื่อเข้าสู่ระบบ
          </p>
        </div>

        {/* Card wrapper */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col gap-6 text-left">
          
          {/* Error display */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-2.5 text-xs text-red-700 leading-normal">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">อีเมลผู้ใช้งาน</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ป้อนรหัสผ่านของคุณ"
                  disabled={loading}
                  className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังลงชื่อเข้าใช้งาน...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>

          </form>

          {/* Action links */}
          <div className="border-t border-gray-50 pt-4 text-center">
            <p className="text-xs text-gray-400">
              ยังไม่มีบัญชีสมาชิก?{" "}
              <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                สมัครสมาชิกใหม่ได้ที่นี่
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
