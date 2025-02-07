/* eslint-disable @typescript-eslint/no-unused-vars */
// 1. app/api/register/route.ts
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/prisma"
import { UserRole } from "@prisma/client"
import { sendVerificationEmail } from "@/lib/mail"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, username, password } = body

    if (!email || !username || !password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return new NextResponse(
        "User with this email or username already exists",
        { status: 409 }
      )
    }

    const hashedPassword = await hash(password, 10)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          username,
          name: username, // Use username as initial name
          password: hashedPassword,
          role: UserRole.USER,
        },
      })

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires: tokenExpiry,
        },
      })

      // Send verification email
      await sendVerificationEmail(email, verificationToken)
    })

    return NextResponse.json({
      success: true,
      message: "Please verify your email before logging in",
    })

  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}