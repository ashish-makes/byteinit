// src/app/(resources)/resources/[category]/page.tsx
import ResourceListPage from "@/components/ui/ResourcesListing";
import { ResourceCategory } from "@prisma/client";

interface CategoryPageProps {
  params: Promise<{ category: ResourceCategory }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Format the category name for display
  const formattedCategory = category
    .replace("_", " ") // Replace underscores with spaces
    .split(" ") // Split into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(" "); // Join with spaces

  return (
    <div className="pt-24">
      <ResourceListPage
        initialFilter={{
          type: "ALL",
          category: category.toUpperCase(),
        }}
        hideCategoryFilter={true} // Hide Type and Category filters
        headerTitle={formattedCategory} // Display the formatted category name
      />
    </div>
  );
}
