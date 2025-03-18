"use client"

import { useState, useEffect } from "react"
import { ResourcesContent } from "@/components/resources/ResourcesContent"
import { notFound, useParams } from "next/navigation"
import { motion } from "framer-motion"

// Resource categories from your schema
const VALID_CATEGORIES = [
  "FRONTEND", "BACKEND", "FULLSTACK", "DEVOPS", "MOBILE", 
  "AI_ML", "DATABASE", "SECURITY", "UI_UX", "DESIGN", "MACHINE_LEARNING", "CLOUD", "OTHER"
]

// Helper function to get category label
const getCategoryLabel = (category: string) => {
  switch (category) {
    case "FRONTEND": return "Frontend"
    case "BACKEND": return "Backend"
    case "FULLSTACK": return "Fullstack"
    case "DEVOPS": return "DevOps"
    case "MOBILE": return "Mobile"
    case "AI_ML": return "AI & ML"
    case "DATABASE": return "Database"
    case "SECURITY": return "Security"
    case "UI_UX": return "UI/UX"
    case "DESIGN": return "Design"
    case "MACHINE_LEARNING": return "Machine Learning"
    case "CLOUD": return "Cloud"
    case "OTHER": return "Other"
    default: return category
  }
}

export default function CategoryResourcesPage() {
  // Use the useParams hook instead of accessing params directly
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''
  const categoryParam = slug.toUpperCase()
  
  // Validate category
  if (!VALID_CATEGORIES.includes(categoryParam)) {
    notFound()
  }
  
  const categoryLabel = getCategoryLabel(categoryParam)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState(categoryParam)
  const [type, setType] = useState("ALL")
  const [tag, setTag] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [totalResources, setTotalResources] = useState(0)
  
  // Update category when URL param changes
  useEffect(() => {
    setCategory(categoryParam)
  }, [categoryParam])

  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">{categoryLabel} Resources</h1>
          <p className="text-muted-foreground">
            Explore the best {categoryLabel.toLowerCase()} tools and resources for developers
          </p>
        </div>
        
        {totalResources > 0 && (
          <p className="text-sm text-muted-foreground mb-2">
            Showing {totalResources} {totalResources === 1 ? 'resource' : 'resources'}
          </p>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
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
      </div>
    </div>
  )
} 