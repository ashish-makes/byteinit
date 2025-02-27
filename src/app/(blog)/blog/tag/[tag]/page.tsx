import { Metadata } from 'next'
import { prisma } from "@/prisma"
import BlogCard from "@/components/blog/BlogCard"
import { notFound } from "next/navigation"

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  // Await the params promise
  const resolvedParams = await params
  const tag = decodeURIComponent(resolvedParams.tag)

  return {
    title: `#${tag} - Blog Posts`,
    description: `Posts tagged with #${tag}`,
    openGraph: {
      title: `#${tag} - Blog Posts`,
      description: `Posts tagged with #${tag}`,
    },
  }
}

async function getPostsByTag(tag: string) {
  const posts = await prisma.blog.findMany({
    where: {
      published: true,
      tags: {
        has: tag,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          username: true,
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
          saves: true,
          views: true,
        },
      },
      votes: true,
      saves: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return posts
}

export default async function TagPage({ params }: TagPageProps) {
  // Await the params promise before using its properties
  const resolvedParams = await params
  const tag = decodeURIComponent(resolvedParams.tag)
  const posts = await getPostsByTag(tag)

  if (!posts.length) {
    notFound()
  }

  return (
    <div className="py-6 px-4">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">#{tag}</h1>
            <span className="px-2 py-1 rounded-full bg-muted text-sm">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Posts tagged with #{tag}
          </p>
        </div>

        <div className="grid gap-4">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
