// 2. app/api/verify/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      return NextResponse.json(
        { error: "Verification token and email are required" },
        { status: 400 }
      )
    }

    // Find and validate token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase(),
        token: token,
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      )
    }

    try {
      // Update user and delete token in a transaction
      await prisma.$transaction(async (prisma) => {
        // Update user
        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: { emailVerified: new Date() },
        })

        // Delete used token
        await prisma.verificationToken.delete({
          where: { id: verificationToken.id },
        })
      })

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
      })
    } catch (error) {
      console.error("Transaction error:", error)
      throw error
    }
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
