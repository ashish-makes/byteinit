"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Bookmark, Search, X } from "lucide-react"
import { ResourceCard } from "./ResourceCard"
import { useBookmarks } from "@/hooks/useBookmarks"
import { Input } from "@/components/ui/input"
import { AnimatePresence, motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: string
  category: string
}

// Skeleton Loading Component
function ResourceCardSkeleton() {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden rounded-xl border p-4 border-gray-950/[.1] bg-white dark:border-gray-50/[.1] dark:bg-neutral-900">
      {/* Icon and Title Section */}
      <div className="flex flex-row items-center gap-3">
        {/* Icon Skeleton */}
        <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800" />

        {/* Title and Category Skeleton */}
        <div className="flex flex-col flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-3 w-1/2 mt-2 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Bookmark Button Skeleton */}
        <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Description Skeleton */}
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full bg-gray-200 dark:bg-gray-800" />
        <Skeleton className="h-3 w-2/3 bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Tags Section Skeleton */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>

      {/* Author and Date Section Skeleton */}
      <div className="mt-4 flex flex-col gap-2">
        {/* Author Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Date and Link Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  )
}

export default function SavedResources() {
  const [savedResources, setSavedResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true) // Loading state

  const { savedResourceIds, toggleBookmark } = useBookmarks()

  useEffect(() => {
    fetchSavedResources()
  }, [])

  useEffect(() => {
    const filtered = savedResources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredResources(filtered)
  }, [searchTerm, savedResources])

  const fetchSavedResources = async () => {
    try {
      const response = await fetch("/api/saved-resources")
      const data = await response.json()
      const resources = data.map((item: { resource: Resource }) => item.resource)
      setSavedResources(resources)
      setFilteredResources(resources)
    } catch {
      toast.error("Could not load resources")
    } finally {
      setIsLoading(false) // Set loading to false after fetching
    }
  }

  const handleUnsave = async (resourceId: string) => {
    await toggleBookmark(resourceId)
    setSavedResources((prev) => prev.filter((resource) => resource.id !== resourceId))
  }

  return (
    <div className="container px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-white flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          Saved
        </h2>
        <div className="relative w-48">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 rounded-full"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          {searchTerm && (
            <X 
              onClick={() => setSearchTerm("")} 
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 cursor-pointer" 
            />
          )}
        </div>
      </div>

      {isLoading ? ( // Show skeleton loading while fetching
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ResourceCardSkeleton />
            </motion.div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? ( // Show empty state if no resources
        <div className="text-center py-12 text-neutral-500">
          No resources found
        </div>
      ) : ( // Show filtered resources
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ResourceCard
                  {...resource}
                  isBookmarked={savedResourceIds.includes(resource.id)}
                  onBookmarkClick={() => handleUnsave(resource.id)}
                  tags={[resource.type, resource.category]}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}