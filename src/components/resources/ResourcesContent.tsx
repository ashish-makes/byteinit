"use client"

import { useState, useEffect } from "react"
import { ResourceCard } from "@/components/ui/ResourceCard"
import { useBookmarks } from "@/hooks/useBookmarks"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

// Resource interface definition
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  tags: string[];
  uniqueViews: number;
  totalViews: number;
  likes: number;
  saves: number;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

interface ResourcesContentProps {
  searchTerm: string;
  category: string;
  type: string;
  tag?: string;
  sortBy: string;
  viewMode: "grid" | "list";
  onResourcesLoaded?: (count: number) => void;
}

function ResourceCardSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border bg-white dark:bg-neutral-900 opacity-40">
      <div className="p-4 animate-pulse">
        <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-3"></div>
        <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded mb-1"></div>
        <div className="h-4 w-4/5 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="flex">
            <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700 mr-2"></div>
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResourcesContent({
  searchTerm,
  category,
  type,
  tag,
  sortBy,
  viewMode,
  onResourcesLoaded
}: ResourcesContentProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { savedResourceIds, toggleBookmark } = useBookmarks()

  useEffect(() => {
    fetchResources()
  }, [category, type, tag, sortBy])

  useEffect(() => {
    const safeResources = Array.isArray(resources) ? resources : []
    const filtered = safeResources
      .filter(
        (resource) =>
          (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    setFilteredResources(filtered)
    onResourcesLoaded?.(filtered.length)
  }, [resources, searchTerm, onResourcesLoaded])

  const fetchResources = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (type !== "ALL") params.append("type", type)
      if (category !== "ALL") params.append("category", category)
      if (tag) params.append("tag", tag)
      params.append("sort", sortBy)

      const response = await fetch(`/api/resources?${params}`)
      const data = await response.json()
      setResources(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error("Failed to fetch resources")
      setResources([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmarkClick = async (resourceId: string) => {
    await toggleBookmark(resourceId)
  }

  // Add staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2" 
            : "space-y-6 mt-2"
          }
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <ResourceCardSkeleton />
            </motion.div>
          ))}
        </motion.div>
      ) : filteredResources.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            variants={containerVariants}
            className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2" 
              : "space-y-6 mt-2"
            }
          >
            {filteredResources.map((resource) => (
              <motion.div
                key={resource.id}
                variants={itemVariants}
              >
                <ResourceCard
                  id={resource.id}
                  title={resource.title}
                  description={resource.description}
                  url={resource.url}
                  type={resource.type}
                  category={resource.category}
                  tags={resource.tags}
                  createdAt={resource.createdAt}
                  user={resource.user}
                  isBookmarked={savedResourceIds.includes(resource.id)}
                  likes={resource.likes}
                  saves={resource.saves}
                  onBookmarkClick={() => handleBookmarkClick(resource.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center h-[400px] text-center mt-8">
          <h3 className="text-xl font-semibold mb-2">No resources found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
} 