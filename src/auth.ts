/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "next-auth/adapters"
import { prisma } from "@/prisma"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: async (user: any) => {
      // Remove the id field from the user data
      const { id, ...userData } = user

      // For OAuth users, generate username from email
      // For credential users, use their name as username
      let username = userData.name || userData.email?.split('@')[0] || ''
      let counter = 1

      // Keep trying until we find a unique username
      while (true) {
        const exists = await prisma.user.findUnique({
          where: { username }
        })
        if (!exists) break
        username = `${username}${counter}`
        counter++
      }

      // Create user with generated username
      return prisma.user.create({
        data: {
          ...userData,
          username,
          role: UserRole.USER
        }
      })
    }
  } as Adapter,
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials || !credentials.emailOrUsername || !credentials.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.emailOrUsername as string },
              { username: credentials.emailOrUsername as string }
            ],
          },
        })

        if (!user?.password) return null
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string, 
          user.password
        )
        if (!isPasswordValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role || "USER",
          username: user.username || ""
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.username = token.username as string
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
      }

      if (trigger === "update" && session) {
        token.name = session.user.name
        token.email = session.user.email
        token.picture = session.user.image
      }

      return token
    }
  },
  session: { strategy: "jwt" },
})

// For middleware usage
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

