"use client"

import { ResourceCard } from "@/components/ui/ResourceCard"
import { useSavedResources } from "@/contexts/SavedResourcesContext"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

// Client component for the search page
export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { savedResources, toggleSave } = useSavedResources()

  useEffect(() => {
    if (!query) {
      setResources([])
      setLoading(false)
      return
    }

    async function fetchSearchResults() {
      try {
        setLoading(true)
        const response = await fetch(`/api/resources/search?q=${encodeURIComponent(query)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results')
        }
        
        const data = await response.json()
        setResources(data.resources || [])
      } catch (error) {
        console.error('Error fetching search results:', error)
        setResources([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  if (!query) {
    // Redirect to resources page if no query
    return (
      <div className="py-6 px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          No Search Query
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Please enter a search term to find resources.
        </p>
      </div>
    )
  }

  return (
    <div className="py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Search Results
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {resources.length} {resources.length === 1 ? 'result' : 'results'} for "{query}"
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">
              Searching for resources...
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  id={resource.id}
                  title={resource.title}
                  description={resource.description}
                  url={resource.url}
                  type={resource.type}
                  category={resource.category}
                  tags={resource.tags}
                  createdAt={resource.createdAt}
                  user={resource.user}
                  isBookmarked={savedResources.has(resource.id)}
                  likes={resource.likes}
                  saves={resource.saves}
                  reactions={resource.reactions}
                  onBookmarkClick={() => toggleSave(resource.id)}
                />
              ))}
            </div>

            {resources.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No results found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 