import { Metadata } from "next"
import { ClientResourcesWrapper } from "@/components/resources/ClientResourcesWrapper"

export const metadata: Metadata = {
  title: "Most Popular Resources | ByteInit",
  description: "Discover the most popular and widely-used developer tools and resources",
}

// Server component for better SEO
export default function PopularResourcesPage() {
  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Most Popular Resources</h1>
          <p className="text-muted-foreground">
            Discover the most popular and widely-used developer tools and resources
          </p>
        </div>

        {/* Client component for interactive features */}
        <ClientResourcesWrapper 
          defaultCategory="ALL"
          defaultType="ALL"
          defaultSortBy="popular"
        />
      </div>
    </div>
  )
} 