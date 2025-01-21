/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

// Add this constant for base URL handling
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://byteinit.netlify.app'

const VerifyPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'error'>('loading')
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      const email = searchParams.get("email")

      if (!token || !email) {
        setVerificationStatus('error')
        setError("Missing verification parameters")
        return
      }

      try {
        const verifyUrl = `${BASE_URL}/api/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        const response = await fetch(verifyUrl)
        const data = await response.json()

        if (response.ok) {
          // Redirect to verification success page instead of handling success here
          router.push("/verify-success")
        } else {
          setVerificationStatus('error')
          setError(data.error || "Verification failed")
        }
      } catch (error) {
        setVerificationStatus('error')
        setError("An error occurred during verification")
      }
    }

    verifyEmail()
  }, [router, searchParams])

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
              {verificationStatus === 'loading' && (
                <div className="p-4 rounded-full bg-primary/10 dark:bg-primary/20">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              )}
              {verificationStatus === 'error' && (
                <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              )}
            </motion.div>
            
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold">
                {verificationStatus === 'loading' && "Verifying your email..."}
                {verificationStatus === 'error' && "Verification Failed"}
              </CardTitle>
              
              <CardDescription className="text-base">
                {verificationStatus === 'loading' && "Please wait while we verify your email address."}
                {verificationStatus === 'error' && error}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {verificationStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-sm text-center">
                  <p className="text-red-600 dark:text-red-400">
                    Please try registering again or contact support if the problem persists.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/auth/register")}
                  >
                    Back to Registration
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  )
}