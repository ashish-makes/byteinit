"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Bookmark, Search, X } from "lucide-react"
import { ResourceCard } from "./ResourceCard"
import { useBookmarks } from "@/hooks/useBookmarks"
import { Input } from "@/components/ui/input"
import { AnimatePresence, motion } from "framer-motion"

interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: string
  category: string
}

export default function SavedResources() {
  const [savedResources, setSavedResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [searchTerm, setSearchTerm] = useState("")

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

      {filteredResources.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          No resources found
        </div>
      ) : (
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