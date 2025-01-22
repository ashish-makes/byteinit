import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { resetPasswordTemplate } from "@/lib/mail/templates/reset-password"
import { sendMail } from "@/lib/mail"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  console.log("Received request:", req.method, req.url)

  try {
    const contentType = req.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ success: false, error: "Invalid content type. Expected JSON." }, { status: 400 })
    }

    const body = await req.json()
    console.log("Request body:", body)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Invalid email provided" }, { status: 400 })
    }

    console.log("Searching for user with email:", email)
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.log("User not found")
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link will be sent.",
      })
    }

    console.log("User found, generating reset token")
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    console.log("Updating user with reset token")
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    console.log("Generating email template")
    const emailTemplate = resetPasswordTemplate(email, resetToken)

    console.log("Sending email")
    await sendMail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    console.log("Email sent successfully")
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link will be sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 })
  }
}

