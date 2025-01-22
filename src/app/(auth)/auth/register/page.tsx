"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Coffee, Chrome, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { toast, Toaster } from "sonner"

interface FormData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export default function RegistrationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      toast.error("All fields are required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return false
    }

    if (formData.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error("Username must be at least 3 characters and contain only letters, numbers, and underscores")
      return false
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return false
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy")
      return false
    }

    return true
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Error signing in with Google:", error)
      toast.error("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("discord", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Error signing in with Discord:", error)
      toast.error("Failed to sign in with Discord. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          subscribeToNewsletter,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Registration failed. Please try again.")
      }

      toast.success("Account created successfully! Please verify your email.")
      router.push("/auth/verify-email")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      <Toaster richColors />
      {/* Left side - Registration form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background dark:bg-zinc-950">
        <Card className="w-full max-w-[500px] shadow-xl dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Byteinit</span>
            </div>
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="dark:bg-zinc-800 dark:border-zinc-700"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="username">Username</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Username must be at least 3 characters and can only contain letters, numbers, and underscores</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="dark:bg-zinc-800 dark:border-zinc-700"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="dark:bg-zinc-800 dark:border-zinc-700"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="dark:bg-zinc-800 dark:border-zinc-700"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={subscribeToNewsletter}
                    onCheckedChange={(checked) => setSubscribeToNewsletter(checked as boolean)}
                  />
                  <label
                    htmlFor="newsletter"
                    className="text-sm text-muted-foreground"
                  >
                    Subscribe to our newsletter for updates and developer resources
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full dark:bg-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background dark:bg-zinc-900 px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full dark:bg-zinc-800 dark:border-zinc-700"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full dark:bg-zinc-800 dark:border-zinc-700"
                onClick={handleGithubSignIn}
                disabled={isLoading}
              >
                                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
<path d="M 18.90625 7 C 18.90625 7 12.539063 7.4375 8.375 10.78125 C 8.355469 10.789063 8.332031 10.800781 8.3125 10.8125 C 7.589844 11.480469 7.046875 12.515625 6.375 14 C 5.703125 15.484375 4.992188 17.394531 4.34375 19.53125 C 3.050781 23.808594 2 29.058594 2 34 C 1.996094 34.175781 2.039063 34.347656 2.125 34.5 C 3.585938 37.066406 6.273438 38.617188 8.78125 39.59375 C 11.289063 40.570313 13.605469 40.960938 14.78125 41 C 15.113281 41.011719 15.429688 40.859375 15.625 40.59375 L 18.0625 37.21875 C 20.027344 37.683594 22.332031 38 25 38 C 27.667969 38 29.972656 37.683594 31.9375 37.21875 L 34.375 40.59375 C 34.570313 40.859375 34.886719 41.011719 35.21875 41 C 36.394531 40.960938 38.710938 40.570313 41.21875 39.59375 C 43.726563 38.617188 46.414063 37.066406 47.875 34.5 C 47.960938 34.347656 48.003906 34.175781 48 34 C 48 29.058594 46.949219 23.808594 45.65625 19.53125 C 45.007813 17.394531 44.296875 15.484375 43.625 14 C 42.953125 12.515625 42.410156 11.480469 41.6875 10.8125 C 41.667969 10.800781 41.644531 10.789063 41.625 10.78125 C 37.460938 7.4375 31.09375 7 31.09375 7 C 31.019531 6.992188 30.949219 6.992188 30.875 7 C 30.527344 7.046875 30.234375 7.273438 30.09375 7.59375 C 30.09375 7.59375 29.753906 8.339844 29.53125 9.40625 C 27.582031 9.09375 25.941406 9 25 9 C 24.058594 9 22.417969 9.09375 20.46875 9.40625 C 20.246094 8.339844 19.90625 7.59375 19.90625 7.59375 C 19.734375 7.203125 19.332031 6.964844 18.90625 7 Z M 18.28125 9.15625 C 18.355469 9.359375 18.40625 9.550781 18.46875 9.78125 C 16.214844 10.304688 13.746094 11.160156 11.4375 12.59375 C 11.074219 12.746094 10.835938 13.097656 10.824219 13.492188 C 10.816406 13.882813 11.039063 14.246094 11.390625 14.417969 C 11.746094 14.585938 12.167969 14.535156 12.46875 14.28125 C 17.101563 11.410156 22.996094 11 25 11 C 27.003906 11 32.898438 11.410156 37.53125 14.28125 C 37.832031 14.535156 38.253906 14.585938 38.609375 14.417969 C 38.960938 14.246094 39.183594 13.882813 39.175781 13.492188 C 39.164063 13.097656 38.925781 12.746094 38.5625 12.59375 C 36.253906 11.160156 33.785156 10.304688 31.53125 9.78125 C 31.59375 9.550781 31.644531 9.359375 31.71875 9.15625 C 32.859375 9.296875 37.292969 9.894531 40.3125 12.28125 C 40.507813 12.460938 41.1875 13.460938 41.8125 14.84375 C 42.4375 16.226563 43.09375 18.027344 43.71875 20.09375 C 44.9375 24.125 45.921875 29.097656 45.96875 33.65625 C 44.832031 35.496094 42.699219 36.863281 40.5 37.71875 C 38.5 38.496094 36.632813 38.84375 35.65625 38.9375 L 33.96875 36.65625 C 34.828125 36.378906 35.601563 36.078125 36.28125 35.78125 C 38.804688 34.671875 40.15625 33.5 40.15625 33.5 C 40.570313 33.128906 40.605469 32.492188 40.234375 32.078125 C 39.863281 31.664063 39.226563 31.628906 38.8125 32 C 38.8125 32 37.765625 32.957031 35.46875 33.96875 C 34.625 34.339844 33.601563 34.707031 32.4375 35.03125 C 32.167969 35 31.898438 35.078125 31.6875 35.25 C 29.824219 35.703125 27.609375 36 25 36 C 22.371094 36 20.152344 35.675781 18.28125 35.21875 C 18.070313 35.078125 17.8125 35.019531 17.5625 35.0625 C 16.394531 34.738281 15.378906 34.339844 14.53125 33.96875 C 12.234375 32.957031 11.1875 32 11.1875 32 C 10.960938 31.789063 10.648438 31.699219 10.34375 31.75 C 9.957031 31.808594 9.636719 32.085938 9.53125 32.464844 C 9.421875 32.839844 9.546875 33.246094 9.84375 33.5 C 9.84375 33.5 11.195313 34.671875 13.71875 35.78125 C 14.398438 36.078125 15.171875 36.378906 16.03125 36.65625 L 14.34375 38.9375 C 13.367188 38.84375 11.5 38.496094 9.5 37.71875 C 7.300781 36.863281 5.167969 35.496094 4.03125 33.65625 C 4.078125 29.097656 5.0625 24.125 6.28125 20.09375 C 6.90625 18.027344 7.5625 16.226563 8.1875 14.84375 C 8.8125 13.460938 9.492188 12.460938 9.6875 12.28125 C 12.707031 9.894531 17.140625 9.296875 18.28125 9.15625 Z M 18.5 21 C 15.949219 21 14 23.316406 14 26 C 14 28.683594 15.949219 31 18.5 31 C 21.050781 31 23 28.683594 23 26 C 23 23.316406 21.050781 21 18.5 21 Z M 31.5 21 C 28.949219 21 27 23.316406 27 26 C 27 28.683594 28.949219 31 31.5 31 C 34.050781 31 36 28.683594 36 26 C 36 23.316406 34.050781 21 31.5 21 Z M 18.5 23 C 19.816406 23 21 24.265625 21 26 C 21 27.734375 19.816406 29 18.5 29 C 17.183594 29 16 27.734375 16 26 C 16 24.265625 17.183594 23 18.5 23 Z M 31.5 23 C 32.816406 23 34 24.265625 34 26 C 34 27.734375 32.816406 29 31.5 29 C 30.183594 29 29 27.734375 29 26 C 29 24.265625 30.183594 23 31.5 23 Z"></path>
</svg>
                Discord
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-sm text-center text-muted-foreground">
            <div className="flex justify-center space-x-4">
              <Link href="/terms" className="hover:text-primary underline underline-offset-4">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-primary underline underline-offset-4">
                Privacy
              </Link>
              <Link href="/support" className="hover:text-primary underline underline-offset-4">
                Support
              </Link>
            </div>
            <p>
              Need help?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right side - Feature showcase */}
      <div className="hidden lg:flex flex-1 relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] opacity-20" />
        <div className="relative w-full flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">All resources a developer needs at one place.</h1>
              <p className="text-xl text-primary-foreground/80">
                Your go-to platform for finding and sharing development tools, libraries, and resources. Join a
                community of developers building the future together.
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center">
                  <div className="mr-4 h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    1
                  </div>
                  Curated development resources and tools
                </li>
                <li className="flex items-center">
                  <div className="mr-4 h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    2
                  </div>
                  Personalized learning paths
                </li>
                <li className="flex items-center">
                  <div className="mr-4 h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    3
                  </div>
                  Active developer community
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}