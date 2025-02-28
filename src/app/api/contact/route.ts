import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Admin Email Template
const getAdminEmailTemplate = (data: any) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>New Contact Form Submission</title>
  </head>
  <body style="background-color: #f5f5f5; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
      <div style="background-color: #18181b; color: white; padding: 24px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold;">ByteInit</div>
      </div>
      <div style="padding: 32px; background-color: white;">
        <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
          New Contact Form Submission
        </h1>
        <div style="margin: 24px 0; padding: 20px; background-color: #f4f4f5; border-radius: 8px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #18181b;">Contact Details</h2>
          <p style="margin: 8px 0; color: #52525b;">
            <strong style="color: #18181b;">Name:</strong> ${data.firstName} ${data.lastName}
          </p>
          <p style="margin: 8px 0; color: #52525b;">
            <strong style="color: #18181b;">Email:</strong> ${data.email}
          </p>
          <p style="margin: 8px 0; color: #52525b;">
            <strong style="color: #18181b;">Phone:</strong> ${data.phone || 'Not provided'}
          </p>
          <p style="margin: 8px 0; color: #52525b;">
            <strong style="color: #18181b;">Issue Type:</strong> ${data.issueType}
          </p>
        </div>
        <div style="margin: 24px 0; padding: 20px; background-color: #f4f4f5; border-radius: 8px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #18181b;">Message</h2>
          <p style="margin: 0; color: #52525b; white-space: pre-wrap;">${data.message}</p>
        </div>
      </div>
      <div style="padding: 24px; background-color: #f4f4f5; text-align: center;">
        <p style="margin: 0; color: #71717a; font-size: 14px;">
          © ${new Date().getFullYear()} ByteInit. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
`

// User Confirmation Email Template
const getUserEmailTemplate = (data: any) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Thank you for contacting us</title>
  </head>
  <body style="background-color: #f5f5f5; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
      <div style="background-color: #18181b; color: white; padding: 24px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold;">ByteInit</div>
      </div>
      <div style="padding: 32px; background-color: white;">
        <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
          Thank you for reaching out!
        </h1>
        <p style="margin: 0 0 24px; color: #71717a; font-size: 16px; line-height: 24px;">
          Hi ${data.firstName}, we've received your message and will get back to you as soon as possible.
        </p>
        <div style="margin: 24px 0; padding: 20px; background-color: #f4f4f5; border-radius: 8px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #18181b;">Your Message Details</h2>
          <p style="margin: 8px 0; color: #52525b;">
            <strong style="color: #18181b;">Issue Type:</strong> ${data.issueType}
          </p>
          <p style="margin: 8px 0; color: #52525b;">
            <strong style="color: #18181b;">Message:</strong>
          </p>
          <p style="margin: 8px 0; color: #52525b; white-space: pre-wrap;">${data.message}</p>
        </div>
        <div style="margin: 24px 0; padding: 20px; background-color: #f4f4f5; border-radius: 8px;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #18181b;">While You Wait</h2>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #52525b;">
            <li style="margin: 8px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" 
                 style="color: #2563eb; text-decoration: none;">
                Check our Help Center
              </a>
              for immediate answers
            </li>
            <li style="margin: 8px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog" 
                 style="color: #2563eb; text-decoration: none;">
                Browse our Blog
              </a>
              for helpful resources
            </li>
            <li style="margin: 8px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/community" 
                 style="color: #2563eb; text-decoration: none;">
                Join our Community
              </a>
              for discussions
            </li>
          </ul>
        </div>
        <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
          Our team typically responds within 24 hours during business days.
        </p>
      </div>
      <div style="padding: 24px; background-color: #f4f4f5; text-align: center;">
        <p style="margin: 0; color: #71717a; font-size: 14px;">
          © ${new Date().getFullYear()} ByteInit. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
`

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${data.issueType}`,
      html: getAdminEmailTemplate(data),
    })

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.email,
      subject: 'Thank you for contacting ByteInit',
      html: getUserEmailTemplate(data),
    })

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 