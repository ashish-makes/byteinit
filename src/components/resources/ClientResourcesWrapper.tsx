"use client"

import { useState, useEffect } from "react"
import { ResourcesContent } from "@/components/resources/ResourcesContent"
import { motion } from "framer-motion"

export interface ClientResourcesWrapperProps {
  defaultCategory?: string;
  defaultType?: string;
  defaultTag?: string;
  defaultSortBy?: string;
  category?: string;
  categoryLabel?: string;
}

export function ClientResourcesWrapper({
  defaultCategory = "ALL",
  defaultType = "ALL",
  defaultTag,
  defaultSortBy = "popular",
  category,
  categoryLabel
}: ClientResourcesWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState(category || defaultCategory)
  const [type, setType] = useState(defaultType)
  const [tag, setTag] = useState<string | undefined>(defaultTag)
  const [sortBy, setSortBy] = useState(defaultSortBy)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [totalResources, setTotalResources] = useState(0)
  
  // Update category when prop changes (for navigation between categories)
  useEffect(() => {
    if (category) {
      setActiveCategory(category)
    }
  }, [category])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {totalResources > 0 && (
        <p className="text-sm text-muted-foreground mb-2">
          Showing {totalResources} {totalResources === 1 ? 'resource' : 'resources'}
        </p>
      )}
      
      <ResourcesContent 
        searchTerm={searchTerm}
        category={activeCategory}
        type={type}
        tag={tag}
        sortBy={sortBy}
        viewMode={viewMode}
        onResourcesLoaded={setTotalResources}
      />
    </motion.div>
  )
} 