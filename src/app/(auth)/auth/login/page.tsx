"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Coffee, KeyRound, Mail, Chrome} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { toast, Toaster } from "sonner"
import Link from "next/link"

const devJokes = [
  {
    joke: "Why do developers prefer dark mode? Because light attracts bugs!",
    author: "Anonymous Dev",
  },
  {
    joke: "A developer walked into a bar. They got stuck because the bar wasn't a progress bar.",
    author: "Bug Free Bill",
  },
  {
    joke: "Why do programmers always mix up Christmas and Halloween? Because Oct 31 == Dec 25!",
    author: "Binary Barry",
  },
  {
    joke: "What's a developer's favorite snack? Cookies! But they always clear them.",
    author: "Cache Queen",
  },
  {
    joke: "What did the developer say to the failed build? It's not you, it's me... but actually it's you.",
    author: "Debugger Dan",
  },
]

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [currentJoke, setCurrentJoke] = useState(devJokes[0])
  const [rememberMe, setRememberMe] = useState(false)
  const [isGithubProcessing, setIsGithubProcessing] = useState(false)
  const [error, setError] = useState("")
  const [linkGitHub, setLinkGitHub] = useState(false)
  const [lastEmail, setLastEmail] = useState("")
  
  const linkWith = searchParams.get("linkWith")
  
  // Check for URL error and linkWith parameters
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      if (errorParam === "OAuthAccountNotLinked") {
        const email = searchParams.get("email")
        if (email) {
          setLastEmail(email)
        }
        setError("An account with this email already exists. Sign in with your password first to link your accounts.")
        setLinkGitHub(true)
      } else if (errorParam === "CredentialsSignin") {
        setError("Invalid email/username or password")
      } else {
        setError(errorParam)
      }
    }
    
    // Check if we're coming from GitHub page with link request
    if (linkWith === "github") {
      const email = searchParams.get("email")
      if (email) {
        setLastEmail(email)
        setFormData(prev => ({ ...prev, emailOrUsername: email }))
      }
      toast.info("Please sign in with your password to link your GitHub account")
    }
  }, [searchParams])
  
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  })

  // Enhanced redirect logic
  useEffect(() => {
    if (status === "authenticated" && session) {
      // If we're trying to link GitHub, do that now
      if (linkGitHub) {
        handleGithubSignIn()
      } else {
        console.log("Authentication successful, redirecting to dashboard...")
        router.replace("/dashboard")
      }
    }
  }, [status, session, router, linkGitHub])

  // Rotate jokes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJoke((prevJoke) => {
        const currentIndex = devJokes.indexOf(prevJoke)
        const nextIndex = (currentIndex + 1) % devJokes.length
        return devJokes[nextIndex]
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.emailOrUsername.trim() || !formData.password.trim()) {
      toast.error("All fields are required")
      return false
    }
    return true
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
  
    try {
      // Save the email for potential account linking
      setLastEmail(formData.emailOrUsername)
      
      const result = await signIn("credentials", {
        emailOrUsername: formData.emailOrUsername.trim(),
        password: formData.password,
        redirect: false,
      })
  
      if (result?.error) {
        console.error("Login error:", result.error)
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email/username or password"
            : "An error occurred during login"
        )
        setIsLoading(false)
        return
      }
  
      if (result?.ok) {
        toast.success("Login successful!")
        
        // If we're trying to link GitHub account
        if (linkWith === "github") {
          setLinkGitHub(true)
          
          // Don't redirect yet - we'll do GitHub sign-in after a short delay
          setTimeout(() => {
            handleGithubSignIn()
          }, 1500)
        } else {
          // Regular flow - redirect to dashboard
          await new Promise(resolve => setTimeout(resolve, 1500))
          window.location.href = "/dashboard"
        }
      }
    } catch (error) {
      console.error("Unexpected error during login:", error)
      toast.error("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      })
    } catch (error) {
      console.error("Google sign-in error:", error)
      toast.error("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsGithubProcessing(true)
    try {
      await signIn("github", {
        callbackUrl: "/dashboard",
        redirect: true,
      })
    } catch (error) {
      console.error("GitHub sign-in error:", error)
      toast.error("Failed to sign in with GitHub")
      setIsGithubProcessing(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      <Toaster richColors />
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background dark:bg-zinc-950">
        <Card className="w-full max-w-[400px] shadow-xl dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Byteinit</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              New to Byteinit?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {linkWith === "github" && (
              <Alert className="mb-4">
                <AlertTitle>Link GitHub Account</AlertTitle>
                <AlertDescription>
                  Sign in with your password to link your GitHub account
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emailOrUsername"
                    placeholder="name@example.com or username"
                    type="text"
                    value={formData.emailOrUsername}
                    onChange={(e) => handleInputChange("emailOrUsername", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-zinc-600"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-zinc-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {linkWith === "github" ? "Linking..." : "Logging in..."}
                  </>
                ) : (
                  linkWith === "github" ? "Sign In & Link GitHub" : "Login"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full dark:bg-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background dark:bg-zinc-900 px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
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
                  disabled={isLoading || isGithubProcessing}
                >
                  {isGithubProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg
                      viewBox="0 0 438.549 438.549"
                      className="mr-2 h-4 w-4"
                    >
                      <path
                        fill="currentColor"
                        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
                      ></path>
                    </svg>
                  )}
                  {isGithubProcessing ? "Connecting..." : "GitHub"}
                </Button>
              </div>
            </form>
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
              Having trouble logging in?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right side - Developer Jokes */}
      <div className="hidden lg:flex flex-1 relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] opacity-20" />
        <div className="relative w-full flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Developer&apos;s Corner</h2>
              <p className="text-primary-foreground/60">A new joke every 5 seconds, just like your build times...</p>
            </div>
            <Alert className="border-primary-foreground/20 bg-primary-foreground/10">
              <div className="space-y-3">
                <AlertDescription className="text-lg font-medium text-primary-foreground">
                  &quot;{currentJoke.joke}&quot;
                </AlertDescription>
                <p className="text-sm text-primary-foreground/60 text-right italic">- {currentJoke.author}</p>
              </div>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}