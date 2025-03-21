"use client"

import { useState, useEffect, useRef } from "react"
import { useBookmarks } from "@/hooks/useBookmarks"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ResourceCard } from "@/components/ui/ResourceCard"

// Define the Resource interface
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  tags: string[];
  createdAt: string;
  user: {
    name?: string;
    image?: string | null;
  };
  likes: number;
  saves: number;
}

export function BookmarkedResources() {
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("ALL")
  const [type, setType] = useState("ALL")
  const [tag, setTag] = useState<string | undefined>(undefined)
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [totalResources, setTotalResources] = useState(0)
  const [savedResources, setSavedResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { data: session } = useSession()
  const { savedResourceIds, toggleBookmark, refreshSavedResources } = useBookmarks()
  
  // Use a ref instead of state to track if we've fetched resources
  // This won't cause re-renders when changed
  const fetchedRef = useRef<{[key: string]: boolean}>({})
  
  // Fetch saved resources when component mounts or savedResourceIds changes
  useEffect(() => {
    // Create a cache key based on the current savedResourceIds
    const cacheKey = savedResourceIds.sort().join(',')
    
    // If we've already fetched this exact set of IDs, don't fetch again
    if (fetchedRef.current[cacheKey]) {
      return
    }
    
    // Skip if no IDs to fetch
    if (savedResourceIds.length === 0) {
      setSavedResources([])
      setTotalResources(0)
      setIsLoading(false)
      fetchedRef.current[cacheKey] = true
      return
    }
    
    // Function to fetch resources
    const fetchResources = async () => {
      setIsLoading(true)
      try {
        // Create a comma-separated string of resource IDs
        const resourceIds = savedResourceIds.join(',')
        
        // First try to fetch with the ids parameter
        let response = await fetch(`/api/resources?ids=${resourceIds}`)
        let data = await response.json()
        
        // Ensure we only display resources that are in the savedResourceIds array
        let filteredResources: Resource[] = []
        
        if (Array.isArray(data)) {
          // Filter the returned resources to only include those in savedResourceIds
          filteredResources = data.filter(resource => 
            savedResourceIds.includes(resource.id)
          ) as Resource[]
        }
        
        // If we didn't get any resources or the API didn't filter properly,
        // fetch each resource individually
        if (filteredResources.length === 0 && savedResourceIds.length > 0) {
          filteredResources = []
          
          // Fetch each resource by ID
          for (const id of savedResourceIds) {
            try {
              const singleResponse = await fetch(`/api/resources/${id}`)
              if (singleResponse.ok) {
                const resourceData = await singleResponse.json()
                if (resourceData && resourceData.id) {
                  filteredResources.push(resourceData as Resource)
                }
              }
            } catch (error) {
              console.error(`Failed to fetch resource with ID ${id}:`, error)
            }
          }
        }
        
        setSavedResources(filteredResources)
        setTotalResources(filteredResources.length)
      } catch (error) {
        console.error("Failed to fetch saved resources:", error)
        setSavedResources([])
        setTotalResources(0)
      } finally {
        setIsLoading(false)
        // Mark this set of IDs as fetched
        fetchedRef.current[cacheKey] = true
      }
    }
    
    fetchResources()
  }, [savedResourceIds]) // Only depend on savedResourceIds

  const handleBookmarkClick = async (resourceId: string) => {
    try {
      // Optimistically update the UI by removing the resource from the list
      setSavedResources(prev => prev.filter(resource => resource.id !== resourceId))
      setTotalResources(prev => prev - 1)
      
      // Call the actual toggle function
      await toggleBookmark(resourceId)
      
      // Force refresh the saved resources to ensure everything is in sync
      refreshSavedResources()
      
      // Clear the cache to force a refetch next time
      fetchedRef.current = {}
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      // If there was an error, refresh to get the correct state
      refreshSavedResources()
      fetchedRef.current = {}
    }
  }

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Sign in to view your saved resources</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to save and view your saved resources.
            </p>
            <Button asChild>
              <Link href="/auth/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {totalResources > 0 && (
        <p className="text-sm text-muted-foreground mb-2">
          Showing {totalResources} {totalResources === 1 ? 'resource' : 'resources'}
        </p>
      )}
      
      {savedResourceIds.length > 0 ? (
        <div className="pb-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
                <p className="text-muted-foreground">Loading your saved resources...</p>
              </div>
            </div>
          ) : savedResources.length > 0 ? (
            <motion.div
              className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-6"
              }
            >
              {savedResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
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
                    isBookmarked={true}
                    likes={resource.likes}
                    saves={resource.saves}
                    onBookmarkClick={() => handleBookmarkClick(resource.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md p-6">
                <h2 className="text-2xl font-bold mb-4">No resources found</h2>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">No saved resources yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't saved any resources yet. Browse resources and click the save icon to save them for later.
            </p>
            <Button asChild>
              <Link href="/resources">
                Browse Resources
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
} 