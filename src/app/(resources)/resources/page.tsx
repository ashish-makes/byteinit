"use client"

import { useState } from "react"
import { ResourcesContent } from "@/components/resources/ResourcesContent"
import { motion } from "framer-motion"

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("ALL")
  const [type, setType] = useState("ALL")
  const [tag, setTag] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [totalResources, setTotalResources] = useState(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ResourcesContent 
        searchTerm={searchTerm}
        category={category}
        type={type}
        tag={tag}
        sortBy={sortBy}
        viewMode={viewMode}
        onResourcesLoaded={setTotalResources}
      />
    </motion.div>
  )
}