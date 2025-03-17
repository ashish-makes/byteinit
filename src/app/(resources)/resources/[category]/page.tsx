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

export default async function CategoryResourcesPage({
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
    <ClientResourcesWrapper 
      category={categoryParam}
      categoryLabel={categoryLabel}
    />
  )
}
