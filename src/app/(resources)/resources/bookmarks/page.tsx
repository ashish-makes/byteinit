import { Metadata } from "next"
import { BookmarkedResources } from "@/components/resources/BookmarkedResources"

export const metadata: Metadata = {
  title: "Saved Resources | ByteInit",
  description: "Your saved collection of developer tools and resources",
}

// Server component for better SEO
export default function SavedResourcesPage() {
  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Saved Resources</h1>
          <p className="text-muted-foreground">
            Your saved resources collection
          </p>
        </div>

        {/* Client component handles authentication and bookmarks functionality */}
        <BookmarkedResources />
      </div>
    </div>
  )
} 