"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, GithubIcon, InfoIcon, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CompleteProfile() {
  const { data: session, update, status } = useSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const router = useRouter();

  // Check if the email is a placeholder (from GitHub OAuth)
  const isPlaceholderEmail = session?.user?.email?.includes("placeholder.com");

  // Validate email as user types
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValidEmail(emailRegex.test(email));
  }, [email]);

  // Debug logging to help diagnose issues
  useEffect(() => {
    if (session?.user) {
      console.log("Session in complete profile:", {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Submitting email update:", email);
      
      // Call API to update user's email
      const response = await fetch("/api/auth/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update email");
      }

      console.log("Email update response:", data);

      // Update the session with the new email
      await update({
        ...session,
        user: {
          ...session?.user,
          email: email
        }
      });
      
      setSuccess(true);
      
      // Redirect to dashboard after a delay to allow session update to propagate
      setTimeout(() => {
        // Refresh the page completely to ensure updated session is reflected everywhere
        window.location.href = "/";
      }, 2500);
    } catch (err: any) {
      console.error("Error updating email:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If the user doesn't have a placeholder email, redirect to home
  useEffect(() => {
    if (status === "authenticated" && session?.user && !isPlaceholderEmail) {
      router.push("/");
    }
  }, [session, status, isPlaceholderEmail, router]);

  // If still loading or redirecting, show nothing
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/95">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (session?.user && !isPlaceholderEmail) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/95 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full border-0 shadow-lg dark:shadow-primary/5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm overflow-hidden">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-between items-center w-full">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center text-sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to home
              </Link>
              <div className="h-4"></div> {/* Spacer for alignment */}
            </div>
            
            <div className="flex justify-center mb-2">
              {session?.user?.image ? (
                <motion.div 
                  className="relative"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-primary to-primary/50 blur-sm opacity-70"></div>
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-white dark:border-zinc-800 relative z-10"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  className="w-[80px] h-[80px] bg-gradient-to-tr from-primary to-primary/60 rounded-full flex items-center justify-center shadow-md"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <span className="text-2xl font-bold text-white">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </motion.div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-center text-foreground">Almost there!</CardTitle>
            <CardDescription className="text-center text-muted-foreground px-4">
              Welcome, <span className="font-medium text-foreground">{session?.user?.name || "there"}</span>! Please add your email to finish setting up your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8 px-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-red-300/20 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-medium">Error</AlertTitle>
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="border-green-300/20 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle className="font-medium">Success!</AlertTitle>
                  <AlertDescription className="text-sm">
                    Your email has been updated successfully. Redirecting to your dashboard...
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="flex p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30">
              <InfoIcon className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">Why we need your email</p>
                <p>
                  GitHub didn't provide your email due to privacy settings. Adding an email will help
                  personalize your experience, enable account recovery, and allow you to receive important notifications.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Your Email Address</span>
                  {email && (
                    <span className={`text-xs ${validEmail ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {validEmail ? 'Valid email format' : 'Invalid email format'}
                    </span>
                  )}
                </Label>
                <div className="relative group">
                  <Mail className={`absolute left-3 top-1/2 -mt-2 h-4 w-4 transition-colors duration-200 ${validEmail && email ? 'text-green-500' : 'text-muted-foreground'} group-focus-within:text-primary`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || success}
                    className={`pl-9 h-11 bg-background/50 dark:bg-background/30 border-muted-foreground/20 dark:border-muted-foreground/10 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 ${validEmail && email ? 'border-green-500 dark:border-green-500/50' : ''}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1 px-1 flex items-center">
                  <InfoIcon className="h-3 w-3 mr-1 inline" />
                  We'll never share your email with anyone else.
                </p>
              </div>
            
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 font-medium shadow-sm hover:shadow transition-all duration-200 mt-2 relative overflow-hidden" 
                  disabled={loading || success || !validEmail || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Updated Successfully
                    </>
                  ) : (
                    "Save Email & Continue"
                  )}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground mt-4">
                  By continuing, you agree to our <Link href="/terms" className="underline hover:text-primary transition-colors">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link>.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 