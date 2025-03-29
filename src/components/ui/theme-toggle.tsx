"use client"

import * as React from "react"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme() // Use resolvedTheme for accurate theme detection
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="relative h-7 w-7 rounded-full bg-background hover:bg-primary/10 transition-colors duration-300"
    >
      {/* Moon icon for light mode */}
      <Moon 
        className={`h-3.5 w-3.5 absolute transition-all duration-300 
          ${resolvedTheme === "light" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 rotate-90"} hover:text-primary`} 
      />
      {/* Sun icon for dark mode */}
      <Sun 
        className={`h-3.5 w-3.5 absolute transition-all duration-300 
          ${resolvedTheme === "dark" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"} hover:text-primary`} 
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
