/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { ResourceCard } from "./ResourceCard"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { useBookmarks } from "@/hooks/useBookmarks"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Layers } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: string
  category: string
  createdAt?: string
  author?: {
    name: string
    image?: string
  }
}

const resourceTypes = ["ALL", "LIBRARY", "TOOL", "FRAMEWORK", "TUTORIAL", "TEMPLATE", "OTHER"]
const resourceCategories = [
  "ALL", "FRONTEND", "BACKEND", "FULLSTACK", "DEVOPS", 
  "MOBILE", "AI_ML", "DATABASE", "SECURITY", "OTHER"
]

export default function ResourceListPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [filter, setFilter] = useState({ type: "ALL", category: "ALL" })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const { savedResourceIds, toggleBookmark } = useBookmarks()

  useEffect(() => {
    fetchResources()
  }, [filter])

  useEffect(() => {
    const filtered = resources.filter(
      (resource) =>
        (filter.type === "ALL" || resource.type === filter.type) &&
        (filter.category === "ALL" || resource.category === filter.category) &&
        (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredResources(filtered)
  }, [resources, filter, searchTerm])

  const fetchResources = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.type !== "ALL") params.append("type", filter.type)
      if (filter.category !== "ALL") params.append("category", filter.category)

      const response = await fetch(`/api/resources?${params}`)
      const data = await response.json()
      setResources(data)
    } catch (error) {
      toast.error("Failed to fetch resources")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmarkClick = async (resourceId: string) => {
    await toggleBookmark(resourceId)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
          <Layers className="h-8 w-8 text-neutral-600" />
          Developer Resources
        </h1>
        <div className="flex items-center gap-2">
          <div className="text-neutral-500">
            {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select 
          onValueChange={(value) => setFilter((prev) => ({ ...prev, type: value }))} 
          value={filter.type}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "ALL" ? "All Types" : type.charAt(0) + type.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          onValueChange={(value) => setFilter((prev) => ({ ...prev, category: value }))} 
          value={filter.category}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {resourceCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "ALL"
                  ? "All Categories"
                  : category.replace("_", "/").charAt(0) + category.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 rounded-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="flex items-center gap-2 text-neutral-500">
            <Layers className="animate-pulse" />
            Loading resources...
          </div>
        </div>
      ) : filteredResources.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 rounded-xl"
        >
          <Layers className="h-16 w-16 mx-auto text-neutral-400 mb-6" />
          <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-4">
            No resources found matching your search
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ResourceCard
                  {...resource}
                  isBookmarked={savedResourceIds.includes(resource.id)}
                  onBookmarkClick={() => handleBookmarkClick(resource.id)}
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