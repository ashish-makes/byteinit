// 2. app/(auth)/verify-email/page.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Inbox, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-muted/20 shadow-lg">
          <CardHeader className="space-y-6">
            <motion.div
              className="w-full flex justify-center"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <div className="p-4 rounded-full bg-primary/10 dark:bg-primary/20">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
                <motion.div
                  className="absolute -right-1 -bottom-1 p-1.5 rounded-full bg-white dark:bg-zinc-950 shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Inbox className="h-4 w-4 text-primary" />
                </motion.div>
              </div>
            </motion.div>
            
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold">Check your inbox</CardTitle>
              <CardDescription className="text-base">
                We&apos;ve sent you a verification link to your email address.
                Please click the link to verify your account.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.open('https://gmail.com', '_blank')}
              >
                Open Gmail
                <ExternalLink className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Need help?
                  </span>
                </div>
              </div>

              <div className="text-center space-y-2 text-sm text-muted-foreground">
                <p>Didn&apos;t receive the email? Check your spam folder or</p>
                <p>
                  <button className="text-primary hover:underline">
                    contact support
                  </button>
                  {" "}if you&apos;re having trouble.
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
