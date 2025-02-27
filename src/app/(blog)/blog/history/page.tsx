import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { redirect } from "next/navigation"
import { HistoryPostList } from "@/components/blog/HistoryPostList"

// Add type for the history posts
interface HistoryPost {
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
    views: number
  }
  views: { createdAt: Date }[]
  createdAt: Date
  tags: string[]
  votes: Array<{ type: 'UP' | 'DOWN' }>
  saves: Array<{ id: string }>
}

async function getHistoryPosts() {
  const session = await auth()
  if (!session?.user?.id) return null

  const historyPosts = await prisma.blog.findMany({
    where: {
      views: {
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
      },
      views: {
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      views: {
        _count: 'desc'
      }
    }
  })

  // Update the mapping to include views array
  const historyPostsWithViews = historyPosts.map(post => ({
    ...post,
    views: post.views.map(view => ({
      createdAt: view.createdAt
    }))
  }))

  return historyPostsWithViews as HistoryPost[]
}

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }

  const historyPosts = await getHistoryPosts()

  return (
    <div className="container py-6 px-3">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reading History</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Posts you&apos;ve recently viewed.
          </p>
        </div>

        {!historyPosts || historyPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No reading history yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Posts you read will appear here.
            </p>
          </div>
        ) : (
          <HistoryPostList initialPosts={historyPosts} />
        )}
      </div>
    </div>
  )
} 