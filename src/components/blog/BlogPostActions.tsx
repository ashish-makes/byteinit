/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, MessageCircle, Bookmark } from "lucide-react"
import { vote, toggleSave } from "@/app/(blog)/blog/actions"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState } from "react"

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
}

export const BlogPostActions = {
  Vote: function VoteActions({ post }: BlogPostActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [voteCount, setVoteCount] = useState(post._count.votes)
    const currentVote = post.votes[0]?.type || null
    const [voted, setVoted] = useState<"UP" | "DOWN" | null>(currentVote)

    const handleVote = async (voteType: "UP" | "DOWN") => {
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

  Secondary: function SecondaryActions({ post }: BlogPostActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isSaved = post.saves.length > 0
    const [saved, setSaved] = useState(isSaved)

    const handleSave = async () => {
      try {
        setIsLoading(true)
        setSaved(!saved)
        await toggleSave(post.id)
        router.refresh()
      } catch (error) {
        setSaved(isSaved)
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={cn("h-8 w-8 p-0", saved && "text-blue-500")}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </Button>
      </div>
    )
  }
} 