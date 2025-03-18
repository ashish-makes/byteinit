"use client"

import { ResourceCard } from "@/components/ui/ResourceCard"
import { useSavedResources } from "@/contexts/SavedResourcesContext"
import { useEffect, useState } from "react"

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { savedResources, toggleSave } = useSavedResources()

  useEffect(() => {
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

  return (
    <>
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {resources.length} {resources.length === 1 ? 'result' : 'results'} found
        </p>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
            <p className="text-muted-foreground">Searching for resources...</p>
          </div>
        </div>
      ) : (
        <>
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md p-6">
                <h2 className="text-2xl font-bold mb-4">No results found</h2>
                <p className="text-muted-foreground mb-6">
                  Try searching with different keywords
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
} 