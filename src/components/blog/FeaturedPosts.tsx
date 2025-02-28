/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, MessageSquare, Bookmark, ArrowRight } from "lucide-react"
import Link from "next/link"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { vote, toggleSave } from "@/app/(blog)/blog/actions"
import { useSavedPosts } from "@/contexts/SavedPostsContext"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface FeaturedPost {
  id: string
  title: string
  content: string
  summary: string | null
  slug: string
  user: {
    name: string | null
    image: string | null
    username: string | null
  }
  _count: {
    votes: number
    comments: number
    saves: number
    views: number
  }
  votes: Array<{ type: 'UP' | 'DOWN' }>
  saves: Array<{ id: string }>
  createdAt: Date
  tags: string[]
}

interface FeaturedPostsProps {
  posts: FeaturedPost[]
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (!posts.length) return null

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full border-b bg-accent/5 mb-6"
    >
      <div className="py-4 sm:py-6 px-3 sm:px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-3 sm:mb-4"
        >
          <h2 className="text-base sm:text-lg font-semibold">Featured Articles</h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground h-8">
            <Link href="/blog/featured" className="flex items-center gap-1">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </motion.div>
        
        {/* Featured Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {posts.slice(0, 3).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <FeaturedCard post={post} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function FeaturedCard({ post }: { post: FeaturedPost }) {
  const router = useRouter()
  const session = useSession()
  const [isLoading, setIsLoading] = React.useState(false)
  const { savedPosts, toggleSavedPost } = useSavedPosts()
  const saved = savedPosts.has(post.id)

  // Get current vote state from post.votes
  const currentVote = post.votes[0]?.type || null
  const [voted, setVoted] = React.useState<"UP" | "DOWN" | null>(currentVote)

  const handleUnauthenticatedAction = () => {
    toast.error("Please sign in to interact with posts")
  }

  const handleVote = async (voteType: "UP" | "DOWN") => {
    if (!session.data?.user) {
      handleUnauthenticatedAction()
      return
    }

    try {
      setIsLoading(true)
      setVoted(voted === voteType ? null : voteType)
      await vote(post.id, voteType)
      router.refresh()
    } catch (error) {
      setVoted(currentVote)
      console.error('Failed to vote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!session.data?.user) {
      handleUnauthenticatedAction()
      return
    }

    try {
      setIsLoading(true)
      toggleSavedPost(post.id) // Update shared state immediately
      await toggleSave(post.id)
      router.refresh()
    } catch (error) {
      toggleSavedPost(post.id) // Revert on error
      console.error('Failed to save:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group hover:bg-accent/50 transition-colors relative overflow-hidden h-full border-[0.5px] border-border/40 hover:border-border/80">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
      
      <motion.div 
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="p-3 sm:p-4 space-y-2 sm:space-y-3 relative h-full flex flex-col"
      >
        {/* Author and Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={post.user?.image || undefined} alt={post.user?.name || ''} />
            <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="text-[11px] sm:text-xs">{post.user?.name}</span>
          <span>·</span>
          <time dateTime={post.createdAt.toISOString()} className="text-[11px] sm:text-xs">
            {new Date(post.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </time>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
          <motion.h3 
            whileHover={{ x: 2 }}
            className="font-medium text-sm sm:text-base leading-snug line-clamp-2"
          >
            {post.title}
          </motion.h3>
        </Link>

        {/* Content Preview - Hide on mobile */}
        <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {post.summary || post.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <motion.div
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/blog/tag/${tag.toLowerCase()}`}
                className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full hover:bg-secondary/80 transition-colors"
              >
                #{tag}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Engagement */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
              onClick={() => handleVote("UP")}
              className={cn(
                "flex items-center gap-1 text-xs text-muted-foreground transition-colors",
                voted === "UP" && "text-green-500 dark:text-green-400",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <motion.div
                animate={voted === "UP" ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={post._count.votes}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="font-medium"
                >
                  {post._count.votes}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{post._count.comments > 0 && post._count.comments}</span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className={cn(
                "h-8 w-8 p-0",
                saved 
                  ? "text-blue-600 dark:text-[#00e5bf]" 
                  : "text-muted-foreground hover:text-foreground",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSave}
            >
              <motion.div
                animate={saved ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
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
      </motion.div>
    </Card>
  )
}