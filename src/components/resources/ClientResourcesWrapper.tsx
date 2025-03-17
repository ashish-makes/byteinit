"use client"

import { useState, useEffect } from "react"
import { ResourcesContent } from "@/components/resources/ResourcesContent"
import { motion } from "framer-motion"

interface ClientResourcesWrapperProps {
  category: string
  categoryLabel: string
}

export function ClientResourcesWrapper({ category: initialCategory, categoryLabel }: ClientResourcesWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [type, setType] = useState("ALL")
  const [tag, setTag] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [totalResources, setTotalResources] = useState(0)
  
  // Update category when prop changes
  useEffect(() => {
    setCategory(initialCategory)
  }, [initialCategory])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        {totalResources > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {totalResources} {totalResources === 1 ? 'resource' : 'resources'}
          </p>
        )}
        
        <ResourcesContent 
          searchTerm={searchTerm}
          category={category}
          type={type}
          tag={tag}
          sortBy={sortBy}
          viewMode={viewMode}
          onResourcesLoaded={setTotalResources}
        />
      </div>
    </motion.div>
  )
} 