/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Flame, Clock, TrendingUp } from "lucide-react"
import BlogCard from "./BlogCard"
import { useState, useEffect } from "react"
import { FeaturedPosts } from "./FeaturedPosts"
import { motion, AnimatePresence } from "framer-motion"
import { FeaturedPostsSkeleton } from "./FeaturedPostsSkeleton"
import { BlogCardSkeleton } from "./BlogCardSkeleton"
import { getBlogPosts } from "@/app/(blog)/blog/actions"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

// Define Post type for better type safety
interface Post {
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
  votes: Array<{ id: string; userId: string | null; blogId: string; type: "UP" | "DOWN" }>
  saves: Array<{ id: string; userId: string | null; blogId: string; createdAt: Date }>
  createdAt: Date
  tags: string[]
  userId?: string | null
}

// Update the section type to include "following"
type BlogListSection = "featured" | "latest" | "popular" | "hot" | "best" | "following";

interface BlogListProps {
  section?: BlogListSection;
  tag?: string;
  topic?: string;
  userId?: string;
}

export default function BlogList({ section = "latest", tag, topic, userId }: BlogListProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<BlogListSection | null>(section)
  const [posts, setPosts] = useState<Post[]>([])
  const [featured, setFeatured] = useState<Post[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const header = document.getElementById("sticky-header")
    const handleScroll = () => {
      if (!header) return
      
      if (window.scrollY > 0) {
        setIsScrolled(true)
        header.classList.add("border-b")
      } else {
        setIsScrolled(false)
        header.classList.remove("border-b")
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getBlogPosts(section, topic)
        
        // Handle case where data might be null or undefined
        if (!data) {
          console.error('No data returned from getBlogPosts')
          setPosts([])
          setFeatured([])
          return
        }
        
        // Ensure items and featured are arrays
        setPosts(Array.isArray(data.items) ? data.items : [])
        
        // Always set featured posts regardless of section
        setFeatured(Array.isArray(data.featured) ? data.featured : [])
      } catch (error) {
        console.error('Error fetching posts:', error)
        setError('Failed to load posts. Please try again later.')
        setPosts([])
        setFeatured([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [section, topic])

  const handleSectionChange = (newSection: BlogListSection) => {
    if (window.location.pathname === '/blog') {
      router.push(`/blog/${newSection}`)
    } else {
      setActiveSection(newSection)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <FeaturedPostsSkeleton />
        <AnimatePresence mode="sync">
          <motion.div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
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
        </AnimatePresence>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Show featured posts on all sections if available */}
      {featured.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FeaturedPosts posts={featured} />
          </motion.div>
        </AnimatePresence>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`sticky z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full transition-all duration-200 ${
          isScrolled ? "py-1" : "py-2"
        }`}
        id="sticky-header"
      >
        <div className="flex items-center h-8 px-4 gap-3">
          {/* Compact Main Navigation Tags */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex bg-secondary/50 rounded-full p-0.5"
          >
            {[
              { id: "hot", icon: Flame, label: "Hot" },
              { id: "latest", icon: Clock, label: "Latest" },
              { id: "popular", icon: TrendingUp, label: "Popular" },
              // Add following section if needed in the UI
              // { id: "following", icon: Users, label: "Following" },
            ].map((section) => (
              <motion.div
                key={section.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "h-6 px-2.5 rounded-full text-xs gap-1",
                    activeSection === section.id
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleSectionChange(section.id as BlogListSection)}
                >
                  <section.icon className="h-3 w-3" />
                  <span className="font-medium">{section.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Posts Grid */}
      <motion.div className="grid gap-2 p-3">
        <AnimatePresence mode="sync">
          {isLoading ? (
            // Skeleton loading state
            <motion.div className="grid gap-1">
              {Array.from({ length: 6 }).map((_, index) => (
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
            <motion.div className="grid gap-1">
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

      {posts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No posts found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Check back later for new content
          </p>
        </div>
      )}
    </div>
  )
}

