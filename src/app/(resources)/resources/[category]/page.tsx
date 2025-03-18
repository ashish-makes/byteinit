// src/app/(resources)/resources/[category]/page.tsx
import { ClientResourcesWrapper } from "@/components/resources/ClientResourcesWrapper"
import { notFound } from "next/navigation"
import { Metadata } from "next"

// Resource categories from your schema
const VALID_CATEGORIES = [
  "FRONTEND", "BACKEND", "FULLSTACK", "DEVOPS", "MOBILE", 
  "AI_ML", "DATABASE", "SECURITY", "UI_UX", "DESIGN", "CLOUD", "OTHER"
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
    case "CLOUD": return "Cloud"
    case "OTHER": return "Other"
    default: return category
  }
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: { params: { category: string } }
): Promise<Metadata> {
  const categoryParam = params.category.toUpperCase()
  const categoryLabel = getCategoryLabel(categoryParam)
  
  return {
    title: `${categoryLabel} Resources | ByteInit`,
    description: `Discover the best ${categoryLabel.toLowerCase()} tools and resources for developers.`
  }
}

// Pre-generate all possible category pages at build time
export function generateStaticParams() {
  return VALID_CATEGORIES.map(category => ({
    category: category.toLowerCase()
  }))
}

export default function CategoryResourcesPage({
  params
}: {
  params: { category: string }
}) {
  const categoryParam = params.category.toUpperCase()
  
  // Validate category
  if (!VALID_CATEGORIES.includes(categoryParam)) {
    notFound()
  }
  
  const categoryLabel = getCategoryLabel(categoryParam)

  return (
    <div className="pb-12 px-4 md:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">{categoryLabel} Resources</h1>
          <p className="text-muted-foreground">
            Explore the best {categoryLabel.toLowerCase()} tools and resources for developers
          </p>
        </div>
        
        <ClientResourcesWrapper 
          defaultCategory={categoryParam}
          defaultType="ALL"
          defaultSortBy="popular"
          category={categoryParam}
          categoryLabel={categoryLabel}
        />
      </div>
    </div>
  )
}
