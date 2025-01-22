// lib/mail/templates/reset-password.ts
const resetPasswordTemplate = (email: string, token: string) => {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    
    return {
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>Reset your password</title>
          </head>
          <body style="background-color: #f5f5f5; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="background-color: #18181b; color: white; padding: 24px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">ByteInit</div>
              </div>
              <div style="padding: 32px; background-color: white;">
                <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
                  Reset your password
                </h1>
                <p style="margin: 0 0 24px; color: #71717a; font-size: 16px; line-height: 24px;">
                  Someone requested a password reset for your account. If this wasn't you, please ignore this email.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
                    Reset Password
                  </a>
                </div>
                <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
                  <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                    Or copy and paste this URL into your browser:
                  </p>
                  <p style="margin: 0; font-size: 14px; word-break: break-all; color: #18181b;">
                    ${resetUrl}
                  </p>
                </div>
                <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                  This link will expire in 1 hour for security reasons.
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
      `,
    }
  }
  
  export { resetPasswordTemplate }