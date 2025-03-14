"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { toast } from "sonner"

// Create a client component that uses useSearchParams
function GitHubAuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  
  // If there's an email param, it means we're coming from a different flow
  const email = searchParams.get("email")
  
  // Auto trigger GitHub sign-in if no error
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      if (error === "OAuthAccountNotLinked") {
        setError("An account with this email already exists. Sign in with your password first, or link your accounts.")
      } else {
        setError(error)
      }
    } else if (!isLoading) {
      // No error and not already loading, trigger GitHub sign-in
      handleGitHubSignIn()
    }
  }, [searchParams])

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("github", {
        callbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error("GitHub sign-in error:", error)
      toast.error("Failed to sign in with GitHub")
      setIsLoading(false)
      router.push("/auth/login")
    }
  }

  // Special handler for linking accounts
  const handleLinkAccounts = async () => {
    setIsLoading(true)
    try {
      // Redirect to login page with special parameter
      router.push(`/auth/login?linkWith=github${email ? `&email=${email}` : ''}`)
    } catch (error) {
      console.error("Error linking accounts:", error)
      setIsLoading(false)
    }
  }

  // If there's an error, show a special UI
  if (error) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>GitHub Authentication Error</CardTitle>
            <CardDescription>
              There was a problem signing in with GitHub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            {error.includes("email already exists") && (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  You already have an account with this email address. You can either:
                </p>
                <div className="grid gap-2">
                  <Button 
                    onClick={handleLinkAccounts}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Link GitHub to Existing Account"
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    asChild 
                    className="w-full"
                  >
                    <Link href="/auth/login">Sign In with Password</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Button 
              variant="link" 
              asChild 
              className="text-sm text-muted-foreground"
            >
              <Link href="/auth/login">Return to Login Page</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Regular sign-in UI
  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Sign In with GitHub</CardTitle>
          <CardDescription>
            Connecting to GitHub...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
        <CardFooter className="flex justify-center text-center text-sm text-muted-foreground">
          <p>
            If you are not redirected automatically,{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto" 
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              click here
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

// Main page component with Suspense boundary
export default function GitHubAuthPage() {
  return (
    <Suspense fallback={
      <div className="container flex h-screen items-center justify-center">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Sign In with GitHub</CardTitle>
            <CardDescription>
              Loading authentication...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <GitHubAuthContent />
    </Suspense>
  )
} 