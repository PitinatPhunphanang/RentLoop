import { DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role: UserRole
    communityId: string | null
    avatarUrl: string | null
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      communityId: string | null
      avatarUrl: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    communityId: string | null
    avatarUrl: string | null
  }
}
