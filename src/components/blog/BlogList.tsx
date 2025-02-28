/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Filter, Flame, Clock, TrendingUp, X } from "lucide-react"
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
  }
  _count: {
    votes: number
    comments: number
    saves: number
    views: number
  }
  votes: Array<{ id: string; userId: string; blogId: string; type: "UP" | "DOWN" }>
  saves: Array<{ id: string; userId: string; blogId: string; createdAt: Date }>
  createdAt: Date
  tags: string[]
}

const filterCategories = {
  timeRange: {
    label: "Time Range",
    options: [
      { value: "today", label: "Last 24 hours" },
      { value: "week", label: "Past week" },
      { value: "month", label: "Past month" },
      { value: "year", label: "Past year" },
      { value: "all", label: "All time" },
    ],
  },
  tags: {
    label: "Topics",
    options: [
      { value: "react", label: "React" },
      { value: "nextjs", label: "Next.js" },
      { value: "typescript", label: "TypeScript" },
      { value: "javascript", label: "JavaScript" },
      { value: "css", label: "CSS" },
    ],
  },
  readTime: {
    label: "Read Time",
    options: [
      { value: "short", label: "Under 5 min" },
      { value: "medium", label: "5-10 min" },
      { value: "long", label: "Over 10 min" },
    ],
  },
  difficulty: {
    label: "Difficulty",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
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
  const [activeFilters, setActiveFilters] = useState({
    timeRange: "today",
    tags: [] as string[],
    readTime: [] as string[],
    difficulty: [] as string[],
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      try {
        const data = await getBlogPosts(section, topic)
        setPosts(data.items)
        setFeatured(section === 'hot' && !topic ? data.featured : [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [section, topic])

  const handleFilterToggle = (
    category: keyof typeof activeFilters,
    value: string
  ) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      if (category === "timeRange") {
        newFilters.timeRange = value
      } else {
        if (prev[category].includes(value)) {
          newFilters[category] = prev[category].filter((item: string) => item !== value)
        } else {
          newFilters[category] = [...prev[category], value]
        }
      }
      return newFilters
    })
  }

  const getActiveFilterCount = () => {
    return Object.entries(activeFilters).reduce((count, [_, value]) => {
      if (Array.isArray(value)) {
        return count + value.length
      }
      return count + (value ? 1 : 0)
    }, 0)
  }

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
        {section === "hot" && <FeaturedPostsSkeleton />}
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

  return (
    <div className="w-full">
      {/* Show featured posts only on hot section */}
      {activeSection === "hot" && (
        <AnimatePresence>
          {isLoading ? (
            <FeaturedPostsSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FeaturedPosts posts={featured} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`sticky top-14 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full transition-all duration-200 ${
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

          {/* Advanced Filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="ml-auto"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full relative">
                  <Filter className="h-3 w-3" />
                  {getActiveFilterCount() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-3.5 w-3.5 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                    >
                      {getActiveFilterCount()}
                    </motion.span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 rounded-md">
                <div className="space-y-4">
                  {Object.entries(filterCategories).map(([key, category], index) => (
                    <div key={key}>
                      {index > 0 && <Separator className="my-3" />}
                      <h3 className="font-medium mb-2 text-sm">{category.label}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {category.options.map((option) => (
                          <Badge
                            key={option.value}
                            variant={
                              activeFilters[key as keyof typeof activeFilters] === option.value ||
                              (Array.isArray(activeFilters[key as keyof typeof activeFilters]) && activeFilters[key as keyof typeof activeFilters].includes(option.value))
                                ? "default"
                                : "outline"
                            }
                            className="cursor-pointer rounded-full px-3"
                            onClick={() => handleFilterToggle(key as keyof typeof activeFilters, option.value)}
                          >
                            {option.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}

                  {getActiveFilterCount() > 0 && (
                    <>
                      <Separator className="my-3" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs rounded-full"
                        onClick={() =>
                          setActiveFilters({
                            timeRange: "today",
                            tags: [],
                            readTime: [],
                            difficulty: [],
                          })
                        }
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear all filters
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>
      </motion.div>

      {/* Posts Grid */}
      <motion.div className="grid gap-3 p-3">
        <AnimatePresence mode="sync">
          {isLoading ? (
            // Skeleton loading state
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

