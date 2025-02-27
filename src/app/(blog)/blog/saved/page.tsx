import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { redirect } from "next/navigation"
import { SavedPostList } from "@/components/blog/SavedPostList"

interface SavedPost {
  id: string
  title: string
  content: string
  summary: string | null
  slug: string
  user: {
    name: string | null
    image: string | null
    username: string | null
  }
  _count: {
    votes: number
    comments: number
    saves: number
  }
  votes: Array<{ type: 'UP' | 'DOWN' }>
  saves: Array<{ id: string }>
  createdAt: Date
  tags: string[]
}

async function getSavedPosts() {
  const session = await auth()
  if (!session?.user?.id) return null

  const savedPosts = await prisma.blog.findMany({
    where: {
      saves: {
        some: {
          userId: session.user.id
        }
      }
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          username: true,
        }
      },
      _count: {
        select: {
          votes: true,
          comments: true,
          saves: true,
          views: true,
        }
      },
      saves: {
        where: {
          userId: session.user.id
        }
      },
      votes: {
        where: {
          userId: session.user.id
        }
      }
    },
    orderBy: {
      saves: {
        _count: 'desc'
      }
    }
  })

  return savedPosts as SavedPost[]
}

export default async function SavedPostsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const savedPosts = await getSavedPosts()

  return (
    <div className="container py-6 px-3">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Saved Posts</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Posts you&apos;ve bookmarked for later reading.
          </p>
        </div>

        {!savedPosts || savedPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No saved posts yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Posts you save will appear here.
            </p>
          </div>
        ) : (
          <SavedPostList initialPosts={savedPosts as SavedPost[]} />
        )}
      </div>
    </div>
  )
} 