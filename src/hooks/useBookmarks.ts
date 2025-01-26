import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { SavedResource } from "../../types/resource"
import { useSession } from "next-auth/react"

export function useBookmarks() {
  const { data: session } = useSession()
  const [savedResources, setSavedResources] = useState<SavedResource[]>([])
  const [isLoadingSavedResources, setIsLoadingSavedResources] = useState(true)

  const fetchSavedResources = useCallback(async () => {
    console.log("Fetching saved resources...")
    if (!session?.user?.id) {
      console.log("No user session, skipping fetch")
      setIsLoadingSavedResources(false)
      setSavedResources([])
      return
    }

    try {
      setIsLoadingSavedResources(true)
      const response = await fetch("/api/saved-resources")
      console.log("API response status:", response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received data:", data)

      let savedResourcesData: SavedResource[] = []

      if (Array.isArray(data.savedResources)) {
        savedResourcesData = data.savedResources
      } else if (Array.isArray(data)) {
        savedResourcesData = data
      }

      console.log("Processed saved resources:", savedResourcesData)
      setSavedResources(savedResourcesData)
    } catch (error) {
      console.error("Failed to fetch saved resources:", error)
      toast.error("Could not load saved resources. Please try again later.")
      setSavedResources([])
    } finally {
      setIsLoadingSavedResources(false)
    }
  }, [session])

  useEffect(() => {
    fetchSavedResources()
  }, [fetchSavedResources])

  const toggleBookmark = async (resourceId: string) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to save resources")
      return
    }
  
    try {
      const isCurrentlySaved = savedResources.some((sr) => sr.resourceId === resourceId)
      
      const response = await fetch(
        isCurrentlySaved 
          ? `/api/saved-resources?resourceId=${resourceId}`
          : "/api/saved-resources", 
        {
          method: isCurrentlySaved ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: !isCurrentlySaved ? JSON.stringify({ resourceId }) : undefined
        }
      )
  
      const responseData = await response.json()
  
      if (!response.ok) {
        throw new Error(responseData.error || "Operation failed")
      }
  
      if (isCurrentlySaved) {
        setSavedResources((prev) => prev.filter((sr) => sr.resourceId !== resourceId))
        toast.success("Resource removed from saved")
      } else {
        setSavedResources((prev) => [...prev, responseData])
        toast.success("Resource saved successfully")
      }
    } catch (error) {
      console.error("Bookmark toggle error:", error)
      toast.error(error instanceof Error ? error.message : "Could not update saved resources")
    }
  }

  const refreshSavedResources = () => {
    fetchSavedResources()
  }

  return {
    savedResources,
    savedResourceIds: savedResources.map((sr) => sr.resourceId),
    isLoadingSavedResources,
    toggleBookmark,
    refreshSavedResources,
  }
}
