import { Metadata } from "next"
import { ClientResourcesWrapper } from "@/components/resources/ClientResourcesWrapper"

export const metadata: Metadata = {
  title: "New & Noteworthy Resources | ByteInit",
  description: "Find newly released and cutting-edge developer tools and resources",
}

// Server component for better SEO
export default function NewResourcesPage() {
  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">New & Noteworthy Resources</h1>
          <p className="text-muted-foreground">
            Find newly released and cutting-edge developer tools and resources
          </p>
        </div>

        {/* Client component for interactive features */}
        <ClientResourcesWrapper 
          defaultCategory="ALL"
          defaultType="ALL"
          defaultSortBy="new"
        />
      </div>
    </div>
  )
} 