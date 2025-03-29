"use client"

import React from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { Smile } from "lucide-react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface Reaction {
  emoji: string
  _count: number
}

interface UserReaction {
  emoji: string
  userId: string
}

interface BlogReactionsProps {
  slug: string
  className?: string
  showPickerButton?: boolean
  variant?: "stacked" | "regular"
}

export function BlogReactions({ 
  slug, 
  className, 
  showPickerButton = false,
  variant = "regular"
}: BlogReactionsProps) {
  const { data: session } = useSession()
  const { theme } = useTheme()
  const [reactions, setReactions] = React.useState<Reaction[]>([])
  const [userReactions, setUserReactions] = React.useState<UserReaction[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/blog/${slug}/reactions`)
      const data = await response.json()
      if (response.ok) {
        setReactions(data.reactions.map((r: any) => ({ emoji: r.emoji, _count: r._count })))
        setUserReactions(data.userReactions)
      }
    } catch (error) {
      console.error("Error fetching reactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchReactions()
  }, [slug])

  const handleReaction = async (emoji: string) => {
    if (!session) {
      toast.error("Please sign in to react to posts")
      return
    }

    try {
      const response = await fetch(`/api/blog/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji })
      })

      const data = await response.json()
      if (response.ok) {
        setReactions(data.reactions)
        setUserReactions(data.userReactions)
      }
    } catch (error) {
      console.error("Error toggling reaction:", error)
      toast.error("Failed to toggle reaction")
    }
  }

  const hasUserReacted = (emoji: string) => {
    return userReactions.some(r => r.emoji === emoji && r.userId === session?.user?.id)
  }

  const reactionsToDisplay = reactions.sort((a, b) => b._count - a._count)

  if (isLoading) return null

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {reactionsToDisplay.length > 0 && (
          <div className="flex flex-wrap items-center">
            <AnimatePresence>
              {reactionsToDisplay.map((reaction, i) => (
                <motion.button
                  key={`emoji-${reaction.emoji}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.15,
                    delay: i * 0.05,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleReaction(reaction.emoji)}
                  disabled={!session}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full transition-all relative",
                    "border-2 border-background",
                    hasUserReacted(reaction.emoji)
                      ? "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20"
                      : "bg-secondary/30 hover:bg-secondary/40 dark:bg-secondary/20 dark:hover:bg-secondary/30",
                    i > 0 && "-ml-1.5"
                  )}
                  style={{
                    zIndex: reactionsToDisplay.length - i
                  }}
                >
                  <span className="text-sm flex items-center justify-center w-full h-full">
                    {reaction.emoji}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Emoji Picker Button with Tooltip */}
      {showPickerButton && session && (
        <TooltipProvider>
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="start">
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: { native: string }) => handleReaction(emoji.native)}
                  theme={theme === "dark" ? "dark" : "light"}
                />
              </PopoverContent>
            </Popover>
            <TooltipContent>Add reaction</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Reactions Display */}
      {reactionsToDisplay.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <AnimatePresence>
            {reactionsToDisplay.map((reaction, i) => (
              <motion.button
                key={`emoji-${reaction.emoji}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.15,
                  delay: i * 0.05,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReaction(reaction.emoji)}
                disabled={!session}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-all",
                  hasUserReacted(reaction.emoji)
                    ? "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20"
                    : "bg-secondary/30 hover:bg-secondary/40 dark:bg-secondary/20 dark:hover:bg-secondary/30"
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction._count}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
} 