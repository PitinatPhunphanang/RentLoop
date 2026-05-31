import prisma from "@/lib/prisma"
import RegisterForm from "@/components/RegisterForm"
import Link from "next/link"
import { Infinity } from "lucide-react"

export default async function RegisterPage() {
  // Fetch communities from real database using Prisma in Server Component
  const communities = await prisma.community.findMany({
    orderBy: {
      name: "asc",
    },
  })

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
            สมัครสมาชิก RentLoop ใหม่
          </h2>
          <p className="text-xs text-gray-400">
            ร่วมแบ่งปัน ค้นหาสิ่งของ และสร้างสัมพันธ์ที่ดีในชุมชนของคุณวันนี้
          </p>
        </div>

        {/* Client form component */}
        <RegisterForm communities={communities} />

      </div>
    </div>
  )
}
