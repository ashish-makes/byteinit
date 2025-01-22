"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KeyRound, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import Link from "next/link"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token")
      const email = searchParams.get("email")

      if (!token || !email) {
        setIsTokenValid(false)
        return
      }

      try {
        const response = await fetch(`/api/verify-reset-token?token=${token}&email=${email}`)
        setIsTokenValid(response.ok)
      } catch (error) {
        console.error("Token verification failed:", error)
        setIsTokenValid(false)
      }
    }

    verifyToken()
  }, [searchParams])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: searchParams.get("token"),
          email: searchParams.get("email"),
          password: values.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      toast.success("Password reset successful! You can now log in with your new password.")
      router.push("/auth/login")
    } catch (error) {
      console.error("Reset password error:", error)
      toast.error("Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
        <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-destructive">Invalid or Expired Link</CardTitle>
            <CardDescription className="text-base">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertDescription>
                Please request a new password reset link. Reset links are valid for a limited time for security reasons.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full"
              onClick={() => router.push("/forgot-password")}
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/auth/login")}
              className="absolute left-4 top-4 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="pt-8">
            <CardTitle className="text-2xl font-bold tracking-tight">Reset your password</CardTitle>
            <CardDescription className="text-base">
              Enter your new password below.
            </CardDescription>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="pl-9 pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="pl-9 pr-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Alert className="border-primary/20 bg-primary/10">
                <AlertDescription className="text-sm">
                  Your password must contain:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </CardContent>
          </form>
        </Form>
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
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}