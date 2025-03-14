/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { vote, toggleSave } from "@/app/(blog)/blog/actions"
import { useSavedPosts } from "@/contexts/SavedPostsContext"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import DOMPurify from 'isomorphic-dompurify'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"

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
  } | null
  _count: {
    votes: number
    comments: number
    saves: number
    views: number
  }
  votes: Array<{ type: 'UP' | 'DOWN'; userId?: string | null }>
  saves: Array<{ id: string; userId?: string | null }>
  createdAt: Date
  tags: string[]
  userId?: string | null
}

interface FeaturedPostsProps {
  posts: FeaturedPost[]
}

// Helper function to strip HTML and truncate text
function stripHtmlAndTruncate(html: string, maxLength: number = 160) {
  // First sanitize the HTML
  const sanitizedHtml = DOMPurify.sanitize(html)
  
  // Create a temporary div to handle HTML content
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = sanitizedHtml
  
  // Get text content and remove extra whitespace
  let text = tempDiv.textContent || tempDiv.innerText
  text = text.replace(/\s+/g, ' ').trim()
  
  // Truncate if needed
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  
  return text
}

// Helper function to format date
function formatDate(date: Date) {
  const relativeTime = formatDistanceToNow(new Date(date), { addSuffix: true })
  const fullDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  
  return { relativeTime, fullDate }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
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
  
  // Format date
  const { relativeTime, fullDate } = formatDate(post.createdAt)

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
    <Card className="relative overflow-hidden h-full border-[0.5px] border-border/40 shadow-none hover:shadow-sm transition-all duration-200 hover:border-border/80">
      <div className="p-4 flex flex-col gap-4 h-full">
        <div className="flex-1 space-y-3">
          {/* Title */}
          <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-medium text-base leading-snug line-clamp-2 hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {stripHtmlAndTruncate(post.summary || post.content)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase()}`}
                className="text-xs px-2 py-0.5 bg-secondary/30 rounded-full hover:bg-secondary/50 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.user?.image || undefined} alt={post.user?.name || ''} />
                <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{post.user?.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">·</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <time dateTime={post.createdAt.toISOString()} className="text-xs text-muted-foreground">
                    {relativeTime}
                  </time>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {fullDate}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-muted-foreground">·</span>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{post._count.comments}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bookmark button */}
      <div className="absolute bottom-3 right-4">
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className={cn(
            "h-8 w-8 p-0",
            saved 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleSave}
        >
          <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
        </Button>
      </div>
    </Card>
  )
}