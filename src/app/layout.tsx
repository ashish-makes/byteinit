/* eslint-disable @typescript-eslint/no-unused-vars */
// import type { Metadata } from "next"
// import { Bricolage_Grotesque } from 'next/font/google'
// import '@/globals.css'
// import { ThemeProvider } from "@/components/theme-provider"
// import Header from "@/components/layout/Header"
// import { Footer } from "@/components/layout/Footer"
// import { SessionProvider } from "next-auth/react"

// const inter = Bricolage_Grotesque({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "Byteinit",
//   description: "Your Central Hub for Developer Resources",
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <SessionProvider>
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${inter.className} flex flex-col min-h-screen`}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <Header />
//           <main className="flex-grow">{children}</main>
//           <Footer />
//         </ThemeProvider>
//       </body>
//     </html>
//     </SessionProvider>
//   )
// }


import { Bricolage_Grotesque, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "@/globals.css"
import { SessionProvider } from "next-auth/react"

const inter = Bricolage_Grotesque({ subsets: ["latin"] })

export const metadata = {
  title: "Byteinit",
  description: "Your go-to platform for finding and sharing development tools, libraries, and resources.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<SessionProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
   </SessionProvider>

  )
}

