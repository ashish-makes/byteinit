/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, MessageCircle, Bookmark } from "lucide-react"
import { vote, toggleSave } from "@/app/(blog)/blog/actions"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import React from "react"
import { useSavedPosts } from "@/contexts/SavedPostsContext"
import { useSession } from "next-auth/react"

interface BlogPostActionsProps {
  post: {
    id: string
    _count: {
      votes: number
      comments: number
      saves: number
    }
    votes: Array<{ type: 'UP' | 'DOWN' }>
    saves: Array<{ id: string }>
  }
  onUnauthenticated: () => void
}

export const BlogPostActions = {
  Vote: function VoteActions({ post, onUnauthenticated }: BlogPostActionsProps) {
    const router = useRouter()
    const session = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [voteCount, setVoteCount] = useState(post._count.votes)
    const currentVote = post.votes[0]?.type || null
    const [voted, setVoted] = useState<"UP" | "DOWN" | null>(currentVote)

    const handleVote = async (voteType: "UP" | "DOWN") => {
      if (!session.data?.user) {
        onUnauthenticated()
        return
      }
      try {
        setIsLoading(true)
        const newVote = voted === voteType ? null : voteType
        setVoted(newVote)
        setVoteCount(prev => voted === voteType ? prev - 1 : voted ? prev : prev + 1)
        await vote(post.id, voteType)
        router.refresh()
      } catch (error) {
        setVoted(currentVote)
        setVoteCount(post._count.votes)
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className="flex flex-col items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("UP")}
          className={cn("h-8 w-8 p-0", voted === "UP" && "text-green-500")}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{voteCount}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("DOWN")}
          className={cn("h-8 w-8 p-0", voted === "DOWN" && "text-red-500")}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    )
  },

  Secondary: function SecondaryActions({ post, onUnauthenticated }: BlogPostActionsProps) {
    const router = useRouter()
    const session = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const { savedPosts, toggleSavedPost } = useSavedPosts()
    const saved = savedPosts.has(post.id)

    const handleSave = async () => {
      if (!session.data?.user) {
        onUnauthenticated()
        return
      }
      try {
        setIsLoading(true)
        toggleSavedPost(post.id)
        await toggleSave(post.id)
        router.refresh()
      } catch (error) {
        toggleSavedPost(post.id)
        console.error('Failed to save:', error)
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className={cn(
              "h-8 w-8 p-0",
              saved 
                ? "text-blue-600 dark:text-[#00e5bf]" 
                : "text-muted-foreground hover:text-foreground",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <motion.div
              animate={saved ? { scale: [1, 1.5, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill={saved ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </motion.div>
          </Button>
        </motion.div>
      </div>
    )
  }
} 