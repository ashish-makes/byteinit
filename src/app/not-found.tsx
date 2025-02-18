"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Home, Code2, Terminal } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-[90vh] w-full flex items-center justify-center p-4">
      <motion.div 
        className="relative w-full max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated background blobs */}
        <motion.div 
          className="absolute -z-10 inset-0 blur-3xl opacity-20"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/30 translate-x-4" />
          <div className="absolute inset-0 rounded-full bg-secondary/30 -translate-x-4" />
        </motion.div>

        <div className="relative bg-background/80 backdrop-blur-md rounded-3xl border shadow-lg px-4 py-6 sm:p-8">
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-xs font-mono text-muted-foreground/60">404.tsx</span>
            </div>
            <Terminal className="h-4 w-4 text-muted-foreground/60" />
          </div>

          {/* Main content */}
          <div className="space-y-6 px-2">
            <div className="space-y-3">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
              >
                <Code2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">404 Not Found</h1>
              </motion.div>
              <p className="text-sm text-muted-foreground">
                Oops! This route hasn't been implemented yet.
              </p>
            </div>

            {/* Code snippet */}
            <motion.div 
              className="rounded-xl bg-secondary/10 p-4 font-mono text-[13px] leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-muted-foreground">Error: Route not found</div>
              <div className="text-primary">at PageRouter.getRoute()</div>
              <div className="text-muted-foreground/70">at renderPage()</div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="rounded-full h-9 px-4 w-full sm:w-auto text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                Previous Route
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push('/')}
                className="rounded-full h-9 px-4 w-full sm:w-auto text-xs"
              >
                <Home className="h-3.5 w-3.5 mr-2" />
                Return to Root
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 