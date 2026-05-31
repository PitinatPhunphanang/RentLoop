"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

const RegisterSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
  phone: z.string().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
  communityId: z.string().min(1, "กรุณาเลือกชุมชนของคุณ"),
})

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const phone = formData.get("phone") as string
  const communityId = formData.get("communityId") as string

  const parsed = RegisterSchema.safeParse({
    name,
    email,
    password,
    phone,
    communityId,
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    }
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: "อีเมลนี้ถูกใช้งานแล้วในระบบ",
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10)

    // Create User
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: hashedPassword,
        phone: parsed.data.phone,
        communityId: parsed.data.communityId,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(parsed.data.name)}`,
      },
    })

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Register Error:", error)
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่อีกครั้ง",
    }
  }
}
