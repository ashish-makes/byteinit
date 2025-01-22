import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    return NextResponse.json({ message: "Token is valid" })
  } catch (error) {
    console.error("Verify reset token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

