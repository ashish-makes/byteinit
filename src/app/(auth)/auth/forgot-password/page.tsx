/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  email: z.string().email("Please enter a valid email address"),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: values.email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send reset email")
      }

      const data = await response.json()
      setSentEmail(values.email)
      setIsEmailSent(true)
      toast.success(data.message || "If an account exists with this email, a password reset link will be sent.")
    } catch (error) {
      console.error("Failed to send reset email:", error)
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
        <Card className="w-full max-w-md shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
            <CardDescription className="text-base">We&apos;ve sent a password reset link to {sentEmail}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-primary/20 bg-primary/10">
              <AlertDescription className="text-sm">
                Please check your email for a link to reset your password. If it doesn&apos;t appear within a few
                minutes, check your spam folder.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEmailSent(false)}
                className="hover:bg-primary/10"
              >
                Try different email
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/auth/login")}
                className="hover:bg-primary/10"
              >
                Back to login
              </Button>
            </div>
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
            <CardTitle className="text-2xl font-bold tracking-tight">Forgot password?</CardTitle>
            <CardDescription className="text-base">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="name@example.com"
                          type="email"
                          className="pl-9"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
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