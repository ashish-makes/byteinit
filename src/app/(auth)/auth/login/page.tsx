"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Use this for programmatic navigation
import { Loader2, Coffee, KeyRound, Mail, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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
];

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentJoke, setCurrentJoke] = useState(devJokes[0]);

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Rotate jokes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentJoke((prevJoke) => {
        const currentIndex = devJokes.indexOf(prevJoke);
        const nextIndex = (currentIndex + 1) % devJokes.length;
        return devJokes[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Login failed:", result.error);
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
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
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    disabled={isLoading}
                    className="pl-9 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-zinc-600"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    disabled={isLoading}
                    className="pl-9 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-zinc-600"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full dark:bg-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background dark:bg-zinc-900 px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Login with Google
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                <a
                  href="#"
                  className="hover:text-primary underline underline-offset-4"
                >
                  Forgot your password?
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Developer Jokes */}
      <div className="hidden lg:flex flex-1 relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] opacity-20" />
        <div className="relative w-full flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Developer&apos;s Corner
              </h2>
              <p className="text-primary-foreground/60">
                A new joke every 5 seconds, just like your build times...
              </p>
            </div>
            <Alert className="border-primary-foreground/20 bg-primary-foreground/10">
              <div className="space-y-3">
                <AlertDescription className="text-lg font-medium text-primary-foreground">
                  &quot;{currentJoke.joke}&quot;
                </AlertDescription>
                <p className="text-sm text-primary-foreground/60 text-right italic">
                  - {currentJoke.author}
                </p>
              </div>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
