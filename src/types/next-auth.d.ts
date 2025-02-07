/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      username: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    role: UserRole
    username: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    username: string
    email?: string | null
    name?: string | null
    picture?: string | null
  }
} 