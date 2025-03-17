"use client"

import { useState } from "react"
import { ResourcesContent } from "@/components/resources/ResourcesContent"
import { motion } from "framer-motion"

export default function LatestResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("ALL")
  const [type, setType] = useState("ALL")
  const [tag, setTag] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState("latest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [totalResources, setTotalResources] = useState(0)

  return (
    <div className="animate-in fade-in duration-300">
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
  )
} 