// import nodemailer from "nodemailer"

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// })

// export async function sendVerificationEmail(email: string, token: string) {
//   const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  
//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: "Verify your email address",
//     html: `
    //   <!DOCTYPE html>
    //   <html>
    //     <head>
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    //       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    //       <title>Verify your email address</title>
    //     </head>
    //     <body style="background-color: #f5f5f5; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
    //       <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
    //         <!-- Header with Logo -->
    //         <div style="background-color: #18181b; color: white; padding: 24px; text-align: center;">
    //           <div style="font-size: 24px; font-weight: bold;">ByteInit</div>
    //         </div>

    //         <!-- Main Content -->
    //         <div style="padding: 32px; background-color: white;">
    //           <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
    //             Verify your email address
    //           </h1>
              
    //           <p style="margin: 0 0 24px; color: #71717a; font-size: 16px; line-height: 24px;">
    //             Thanks for signing up! Please verify your email address to get started. This link will expire in 24 hours.
    //           </p>

    //           <!-- Verification Button -->
    //           <div style="text-align: center; margin: 32px 0;">
    //             <a href="${verificationUrl}" 
    //                style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: background-color 0.2s;">
    //               Verify Email Address
    //             </a>
    //           </div>

    //           <!-- Alternate Link -->
    //           <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
    //             <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
    //               Or copy and paste this URL into your browser:
    //             </p>
    //             <p style="margin: 0; font-size: 14px; word-break: break-all; color: #18181b;">
    //               ${verificationUrl}
    //             </p>
    //           </div>

    //           <!-- Security Notice -->
    //           <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
    //             If you didn't sign up for ByteInit, you can safely ignore this email.
    //           </p>
    //         </div>

    //         <!-- Footer -->
    //         <div style="padding: 24px; background-color: #f4f4f5; text-align: center;">
    //           <p style="margin: 0; color: #71717a; font-size: 14px;">
    //             © ${new Date().getFullYear()} ByteInit. All rights reserved.
    //           </p>
    //         </div>
    //       </div>

    //       <!-- Email client support notice -->
    //       <div style="margin-top: 16px; text-align: center; color: #71717a; font-size: 12px;">
    //         <p style="margin: 0;">
    //           This is an automated message, please do not reply to this email.
    //         </p>
    //       </div>
    //     </body>
    //   </html>
//     `,
//   }

//   try {
//     await transporter.sendMail(mailOptions)
//   } catch (error) {
//     console.error("Failed to send verification email:", error)
//     throw new Error("Failed to send verification email")
//   }
// }


import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendMail(options: nodemailer.SendMailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.error("Error sending email:", error)
        reject(error)
      } else {
        console.log("Email sent successfully:", info.response)
        resolve(info)
      }
    })
  })
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address",
    html: `
            <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <title>Verify your email address</title>
        </head>
        <body style="background-color: #f5f5f5; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <!-- Header with Logo -->
            <div style="background-color: #18181b; color: white; padding: 24px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">ByteInit</div>
            </div>

            <!-- Main Content -->
            <div style="padding: 32px; background-color: white;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
                Verify your email address
              </h1>
              
              <p style="margin: 0 0 24px; color: #71717a; font-size: 16px; line-height: 24px;">
                Thanks for signing up! Please verify your email address to get started. This link will expire in 24 hours.
              </p>

              <!-- Verification Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: background-color 0.2s;">
                  Verify Email Address
                </a>
              </div>

              <!-- Alternate Link -->
              <div style="margin: 24px 0; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
                <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                  Or copy and paste this URL into your browser:
                </p>
                <p style="margin: 0; font-size: 14px; word-break: break-all; color: #18181b;">
                  ${verificationUrl}
                </p>
              </div>

              <!-- Security Notice -->
              <p style="margin: 24px 0 0; color: #71717a; font-size: 14px; line-height: 20px;">
                If you didn't sign up for ByteInit, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; background-color: #f4f4f5; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                © ${new Date().getFullYear()} ByteInit. All rights reserved.
              </p>
            </div>
          </div>

          <!-- Email client support notice -->
          <div style="margin-top: 16px; text-align: center; color: #71717a; font-size: 12px;">
            <p style="margin: 0;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await sendMail(mailOptions)
    console.log("Verification email sent successfully")
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

