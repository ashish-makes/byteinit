/* eslint-disable @typescript-eslint/no-unused-vars */
// 1. app/api/register/route.ts
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/prisma"
import { sendVerificationEmail } from "@/lib/mail"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    // Validate content type
    const contentType = req.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      )
    }

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      )
    }

    const { email, username, password } = body

    // Validate required fields
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate username format and length
    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters and contain only letters, numbers, and underscores" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { name: username.toLowerCase() }
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    try {
      // Create user and verification token in a transaction
      await prisma.$transaction(async (prisma) => {
        // Create user
        const user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: username.toLowerCase(),
            password: hashedPassword,
            emailVerified: null,
          },
        })

        // Create verification token
        await prisma.verificationToken.create({
          data: {
            identifier: email.toLowerCase(),
            token: verificationToken,
            expires: tokenExpiry,
          },
        })
      })

      // Send verification email
      await sendVerificationEmail(email, verificationToken)

      return NextResponse.json({
        success: true,
        message: "Please verify your email before logging in",
      })
    } catch (error) {
      console.error("Transaction error:", error)
      throw error
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}