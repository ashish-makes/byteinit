'use server'

import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleLike(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingLike = await prisma.blogLike.findUnique({
    where: {
      blogId_userId: {
        blogId,
        userId: session.user.id,
      },
    },
  })

  if (existingLike) {
    await prisma.blogLike.delete({
      where: { id: existingLike.id },
    })
  } else {
    await prisma.blogLike.create({
      data: {
        blogId,
        userId: session.user.id,
      },
    })
  }

  revalidatePath('/blog/[slug]')
}

export async function toggleSave(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingSave = await prisma.blogSave.findUnique({
    where: {
      blogId_userId: {
        blogId,
        userId: session.user.id,
      },
    },
  })

  if (existingSave) {
    await prisma.blogSave.delete({
      where: { id: existingSave.id },
    })
  } else {
    await prisma.blogSave.create({
      data: {
        blogId,
        userId: session.user.id,
      },
    })
  }

  revalidatePath('/blog/[slug]')
}

export async function vote(blogId: string, voteType: 'UP' | 'DOWN') {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingVote = await prisma.blogVote.findUnique({
    where: {
      blogId_userId: {
        blogId,
        userId: session.user.id,
      },
    },
  })

  if (existingVote) {
    if (existingVote.type === voteType) {
      await prisma.blogVote.delete({
        where: { id: existingVote.id },
      })
    } else {
      await prisma.blogVote.update({
        where: { id: existingVote.id },
        data: { type: voteType },
      })
    }
  } else {
    await prisma.blogVote.create({
      data: {
        blogId,
        userId: session.user.id,
        type: voteType,
      },
    })
  }

  revalidatePath('/blog/[slug]')
}

export async function recordView(blogId: string) {
  const session = await auth()
  
  // Check if view already exists for this user/IP today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const existingView = await prisma.blogView.findFirst({
    where: {
      blogId,
      userId: session?.user?.id,
      createdAt: {
        gte: today
      }
    }
  })

  if (!existingView) {
    await prisma.blogView.create({
      data: {
        blogId,
        userId: session?.user?.id,
      },
    })
  }
}

export async function getBlogPosts(section: "hot" | "latest" | "popular" | null = 'hot') {
  try {
    console.log('Fetching posts for section:', section)
    
    const baseWhere = {
      published: true,
    }

    // Get posts based on section
    const [posts, featured] = await Promise.all([
      prisma.blog.findMany({
        where: baseWhere,
        orderBy: section === 'latest' 
          ? { createdAt: 'desc' }
          : section === 'popular'
          ? [
              {
                views: {
                  _count: 'desc',
                },
              },
              { createdAt: 'desc' },
            ]
          : [ // hot (default)
              {
                votes: {
                  _count: 'desc',
                },
              },
              { createdAt: 'desc' },
            ],
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
        take: 20,
      }),
      // Featured posts - most engaged posts in the last week
      prisma.blog.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: [
          {
            votes: {
              _count: 'desc',
            },
          },
          {
            comments: {
              _count: 'desc',
            },
          },
          {
            views: {
              _count: 'desc',
            },
          },
        ],
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
        take: 6,
      })
    ])

    console.log('Found posts:', posts.length)
    console.log('Sample post:', posts[0])

    return {
      items: posts,
      featured,
    }
  } catch (error) {
    console.error('[GET_BLOG_POSTS] Error:', error)
    throw new Error('Failed to fetch blog posts')
  }
} 