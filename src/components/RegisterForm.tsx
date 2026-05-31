"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/app/actions/register"
import Link from "next/link"
import { Infinity, UserPlus, Lock, Mail, Phone, Home, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface RegisterFormProps {
  communities: { id: string; name: string }[]
}

export default function RegisterForm({ communities }: RegisterFormProps) {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [communityId, setCommunityId] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!name || !email || !password || !phone || !communityId) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("phone", phone)
      formData.append("communityId", communityId)

      const res = await registerUser(null, formData)

      if (res?.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(res?.error || "เกิดข้อผิดพลาดในการลงทะเบียน")
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล")
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex flex-col gap-6 text-left">
      
      {/* Alert state handles */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-start gap-2.5 text-xs text-red-700 leading-normal animate-fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-2.5 text-xs text-emerald-700 leading-normal animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="สมชาย ใจดี"
              disabled={loading || success}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400"
            />
            <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">อีเมลผู้ใช้งาน</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="somchai@example.com"
              disabled={loading || success}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400"
            />
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">รหัสผ่าน (6 ตัวขึ้นไป)</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ตั้งรหัสผ่านของคุณ"
              disabled={loading || success}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400"
            />
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์ติดต่อ</label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812345678"
              disabled={loading || success}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all placeholder-gray-400"
            />
            <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Community selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">สังกัดพื้นที่ชุมชน</label>
          <div className="relative">
            <select
              required
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              disabled={loading || success}
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all text-gray-700 bg-white"
            >
              <option value="">-- เลือกชุมชนหรือที่อยู่อาศัยของคุณ --</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Home className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังสร้างบัญชีสมาชิก...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>สมัครสมาชิกใหม่</span>
            </>
          )}
        </button>

      </form>

      {/* Action footer */}
      <div className="border-t border-gray-50 pt-4 text-center">
        <p className="text-xs text-gray-400">
          มีบัญชีสมาชิกอยู่แล้ว?{" "}
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            เข้าสู่ระบบได้ที่นี่
          </Link>
        </p>
      </div>

    </div>
  )
}
