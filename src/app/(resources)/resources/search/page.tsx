import { Metadata } from "next"
import { SearchResults } from "@/components/resources/SearchResults"

export const metadata: Metadata = {
  title: "Search Resources | ByteInit",
  description: "Search for developer tools and resources on ByteInit",
}

// Server component for better SEO
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''

  if (!query) {
    return (
      <div className="pb-12 px-4 md:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold">
              Search
            </h1>
            <p className="text-muted-foreground">
              Enter a search term to find resources
            </p>
          </div>
          
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md p-6">
              <h2 className="text-2xl font-bold mb-4">No Search Query</h2>
              <p className="text-muted-foreground mb-6">
                Please enter a search term to find resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">
            Search Results
          </h1>
          <p className="text-muted-foreground">
            Search results for "{query}"
          </p>
        </div>
        
        {/* Client component for interactive features */}
        <SearchResults query={query} />
      </div>
    </div>
  )
} 