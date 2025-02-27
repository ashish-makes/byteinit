import { Metadata } from 'next'
import { prisma } from "@/prisma"
import BlogCard from "@/components/blog/BlogCard"
import { notFound } from "next/navigation"

// Note: searchParams is now a Promise resolving to an object.
interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  // Await searchParams before using it
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''

  return {
    title: `Search results for "${query}" | Blog`,
    description: `Search results for "${query}" in blog posts`,
    openGraph: {
      title: `Search results for "${query}"`,
      description: `Search results for "${query}" in blog posts`,
    },
    robots: {
      index: false,
      follow: true,
    }
  }
}

async function getSearchResults(query: string) {
  if (!query) return []

  const posts = await prisma.blog.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { hasEvery: [query] } },
      ],
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
      votes: true,
      saves: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return posts
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await searchParams before accessing its properties
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''

  if (!query) notFound()

  const posts = await getSearchResults(query)

  return (
    <div className="py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Search Results
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {posts.length} {posts.length === 1 ? 'result' : 'results'} for "{query}"
          </p>
        </div>

        <div className="grid gap-4">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
