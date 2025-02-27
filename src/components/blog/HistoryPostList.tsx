"use client"

import { useState } from "react"
import BlogCard from "./BlogCard"
import { BlogCardSkeleton } from "./BlogCardSkeleton"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNowStrict } from "date-fns"
import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"
import { removeFromHistory, clearHistory } from "@/app/(blog)/blog/actions"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HistoryPostListProps {
  initialPosts: {
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
    }
    votes: Array<{ type: 'UP' | 'DOWN' }>
    saves: Array<{ id: string }>
    views: Array<{ createdAt: Date }>
    createdAt: Date
    tags: string[]
  }[]
}

export function HistoryPostList({ initialPosts }: HistoryPostListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)

  const handleRemoveFromHistory = async (postId: string) => {
    try {
      setLoading(true)
      await removeFromHistory(postId)
      setPosts(posts.filter(post => post.id !== postId))
      toast.success("Post removed from history")
    } catch (error) {
      toast.error("Failed to remove post from history")
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      setLoading(true)
      await clearHistory()
      setPosts([])
      toast.success("History cleared")
    } catch (error) {
      toast.error("Failed to clear history")
    } finally {
      setLoading(false)
    }
  }

  // Group posts by date
  const groupedPosts = posts.reduce((groups, post) => {
    const viewDate = new Date(post.views[0].createdAt)
    const dateKey = viewDate.toDateString()
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(post)
    return groups
  }, {} as Record<string, typeof posts>)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No reading history</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Posts you read will appear here.
        </p>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} in history
        </h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Reading History</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all posts from your reading history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearHistory}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear History
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <AnimatePresence mode="sync">
        {loading ? (
          // Skeleton loading state
          <motion.div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <BlogCardSkeleton />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Grouped posts by date
          Object.entries(groupedPosts).map(([dateKey, datePosts], groupIndex) => (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="space-y-2"
            >
              <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                {new Date().toDateString() === dateKey 
                  ? "Today" 
                  : new Date(Date.now() - 86400000).toDateString() === dateKey
                  ? "Yesterday"
                  : dateKey}
              </h3>
              <div className="grid gap-2">
                {datePosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    <BlogCard post={post} />
                    <div className="flex items-center justify-between mt-0.5 px-4">
                      <p className="text-xs text-muted-foreground">
                        Viewed {formatDistanceToNowStrict(new Date(post.views[0].createdAt))} ago
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFromHistory(post.id)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove from history</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </motion.div>
  )
} 