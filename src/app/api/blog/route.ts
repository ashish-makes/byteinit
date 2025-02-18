import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/prisma'
import { z } from 'zod'
import slugify from 'slugify'

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  summary: z.string().optional(),
  coverImage: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const validatedData = postSchema.parse(body)

    // Create a unique slug
    let slug = slugify(validatedData.title, { lower: true })
    const existingPost = await prisma.blog.findUnique({ where: { slug } })
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }

    const post = await prisma.blog.create({
      data: {
        ...validatedData,
        slug,
        userId: session.user.id,
      },
      include: {
        user: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            saves: true,
          }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: "Invalid input",
        errors: error.errors,
      }, { status: 400 })
    }
    
    console.error('Error creating blog post:', error)
    
    return NextResponse.json({
      message: "Internal server error",
    }, { status: 500 })
  }
}

// Helper function to get unique views
async function getUniqueViews(blogId: string) {
  const views = await prisma.blogView.groupBy({
    by: ['userId'],
    where: {
      blogId,
      userId: { not: null }, // Only count logged-in users
    },
  })
  return views.length
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    // Base query
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
          ? { views: { _count: 'desc' } }
          : { votes: { _count: 'desc' } },
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
            }
          },
          votes: true,
          saves: true,
        },
        take: 20,
      }),
      // Featured posts
      prisma.blog.findMany({
        where: {
          ...baseWhere,
          featured: true,
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
            }
          },
          votes: true,
          saves: true,
        },
        take: 6,
      })
    ])

    // Get unique views for all posts
    const postsWithViews = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        uniqueViews: await getUniqueViews(post.id)
      }))
    )

    return NextResponse.json({
      items: postsWithViews,
      featured: await Promise.all(
        featured.map(async (post) => ({
          ...post,
          uniqueViews: await getUniqueViews(post.id)
        }))
      ),
    })
  } catch (error) {
    console.error('[BLOG_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}