import LeftSidebarWrapper from "@/components/blog/LeftSidebarWrapper"
import RightSidebar from "@/components/blog/RightSidebar"
import BlogHeader from "@/components/blog/BlogHeader"
import { prisma } from "@/prisma"
import { cn } from "@/lib/utils"
import React from 'react'
import { SavedPostsProvider } from "@/contexts/SavedPostsContext"
import { auth } from "@/auth"

// Update the Author interface to match RightSidebar's interface
interface Author {
  id: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
  _count: {
    posts: number
    followers: number
    following: number
  }
}

async function getSidebarData() {
  const [trendingPosts, popularTags, topAuthors] = await Promise.all([
    // Trending Posts
    prisma.blog.findMany({
      where: { published: true },
      orderBy: [{ votes: { _count: 'desc' }}],
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            views: true
          }
        }
      }
    }),

    // Popular Tags
    prisma.blog.findMany({
      where: { published: true },
      select: { tags: true },
      take: 100
    }).then(posts => {
      const tagCount = posts.flatMap(p => p.tags)
        .reduce((acc, tag) => ({
          ...acc,
          [tag]: (acc[tag] || 0) + 1
        }), {} as Record<string, number>);
      
      return Object.entries(tagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
    }),

    // Top Authors
    prisma.user.findMany({
      where: {
        blogs: {
          some: {
            published: true
          }
        }
      },
      include: {
        _count: {
          select: {
            blogs: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: {
        blogs: {
          _count: 'desc'
        }
      },
      take: 5
    }).then(authors => authors.map(author => ({
      ...author,
      _count: {
        posts: author._count.blogs,
        followers: author._count.followers,
        following: author._count.following
      }
    })))
  ]);

  return {
    trendingPosts,
    popularTags,
    topAuthors
  };
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug?: string }
}) {
  const { trendingPosts, popularTags, topAuthors } = await getSidebarData()
  const isSavedPage = params.slug === 'saved'

  // Get initial saved posts from the server
  const session = await auth()
  let initialSavedPosts: string[] = []
  
  if (session?.user?.id) {
    const savedPosts = await prisma.blog.findMany({
      where: {
        saves: {
          some: {
            userId: session.user.id
          }
        }
      },
      select: { id: true }
    })
    initialSavedPosts = savedPosts.map(post => post.id)
  }

  return (
    <div className="min-h-screen">
      <SavedPostsProvider initialSavedPosts={initialSavedPosts}>
        <BlogHeader />
        <div className="flex pt-14">
          {/* Left Sidebar - Desktop Only */}
          <div className="fixed left-0 top-14 bottom-0 w-60 hidden lg:block border-r bg-background/80 backdrop-blur-sm">
            <div className="h-full">
              <LeftSidebarWrapper />
            </div>
          </div>

          {/* Main Content */}
          <div className={cn(
            "flex-1",
            isSavedPage ? "mx-auto max-w-5xl px-4" : "lg:ml-60 lg:mr-72"
          )}>
            <div className="w-full">{children}</div>
          </div>

          {/* Right Sidebar - Desktop Only */}
          {!isSavedPage && (
            <div className="fixed right-0 top-14 bottom-0 w-72 hidden lg:block border-l bg-background/80 backdrop-blur-sm">
              <div className="h-full">
                <RightSidebar 
                  trendingPosts={trendingPosts} 
                  popularTags={popularTags} 
                  topAuthors={topAuthors} 
                />
              </div>
            </div>
          )}
        </div>
      </SavedPostsProvider>
    </div>
  )
}

