"use client"

import { useState } from "react"
import BlogCard from "./BlogCard"
import { BlogCardSkeleton } from "./BlogCardSkeleton"
import { motion, AnimatePresence } from "framer-motion"

interface SavedPostListProps {
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
    createdAt: Date
    tags: string[]
  }[]
}

export function SavedPostList({ initialPosts }: SavedPostListProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)

  return (
    <motion.div 
      className="grid gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
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
          // Actual posts
          <motion.div className="grid gap-3">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 