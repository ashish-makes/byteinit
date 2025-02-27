import { auth } from "@/auth"
import { prisma } from "@/prisma"
import LeftSidebar from "./LeftSidebar"

async function getSavedCount() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      console.log("No user session found")
      return 0
    }

    // First try to get the actual saved blogs to verify data
    const savedBlogs = await prisma.blog.findMany({
      where: {
        saves: {
          some: {
            userId: session.user.id
          }
        }
      },
      select: {
        id: true,
        title: true
      }
    })
    console.log("Found saved blogs:", savedBlogs)

    const count = savedBlogs.length
    console.log("Found saved count:", count, "for user:", session.user.id)
    return count
  } catch (error) {
    console.error("Error fetching saved count:", error)
    return 0
  }
}

export default async function LeftSidebarWrapper() {
  console.log("LeftSidebarWrapper is being rendered")
  const savedCount = await getSavedCount()
  console.log("LeftSidebarWrapper passing savedCount:", savedCount)
  return <LeftSidebar savedCount={savedCount} />
} 