import { Metadata } from "next"
import { ResourcesHeader } from "@/components/resources/ResourcesHeader"
import LeftSidebar from "@/components/resources/LeftSidebar"
import { TrendingSidebar } from "@/components/resources/TrendingSidebar"
import { SavedPostsProvider } from "@/contexts/SavedPostsContext"
import { SavedResourcesProvider } from "@/contexts/SavedResourcesContext"
import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Resources - ByteInit",
  description: "Discover and share developer resources, tools, libraries, and more.",
}

export default async function ResourcesLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug?: string }
}) {
  // Get initial saved resources from the server
  const session = await auth()
  let initialSavedResources: string[] = []
  
  if (session?.user?.id) {
    const savedResources = await prisma.savedResource.findMany({
      where: {
        userId: session.user.id
      },
      select: { resourceId: true }
    })
    initialSavedResources = savedResources.map(saved => saved.resourceId)
  }

  const isBookmarksPage = params.slug === 'bookmarks';

  return (
    <div className="min-h-screen">
      <SavedPostsProvider initialSavedPosts={[]}>
        <SavedResourcesProvider initialSavedResources={initialSavedResources}>
          <ResourcesHeader />
          <div className="flex">
            {/* Left Sidebar - Desktop Only */}
            <div className="fixed left-0 top-11 bottom-0 w-60 hidden lg:block border-r bg-background/80 backdrop-blur-sm">
              <div className="h-full">
                <LeftSidebar />
              </div>
            </div>

            {/* Main Content */}
            <div className={cn(
              "flex-1",
              isBookmarksPage ? "mx-auto max-w-5xl px-4" : "lg:ml-60 lg:mr-72"
            )}>
              <div className="w-full py-6">{children}</div>
            </div>

            {/* Right Sidebar - Desktop Only */}
            {!isBookmarksPage && (
              <div className="fixed right-0 top-11 bottom-0 w-72 hidden lg:block border-l bg-background/80 backdrop-blur-sm">
                <div className="h-full">
                  <TrendingSidebar />
                </div>
              </div>
            )}
          </div>
        </SavedResourcesProvider>
      </SavedPostsProvider>
    </div>
  )
}

