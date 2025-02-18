import { prisma } from "@/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    // Get current date ranges
    const now = new Date()
    const today = new Date(now.setHours(0, 0, 0, 0))
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get all user's blog posts
    const posts = await prisma.blog.findMany({
      where: {
        userId: userId,
        published: true,
      },
      include: {
        _count: {
          select: {
            votes: true,
            comments: true,
            views: true,
          }
        }
      }
    })

    // Calculate total stats
    const totalPosts = posts.length
    const totalViews = posts.reduce((acc, post) => acc + post._count.views, 0)
    const totalVotes = posts.reduce((acc, post) => acc + post._count.votes, 0)

    // Calculate today's stats
    const todayPosts = posts.filter(post => 
      post.createdAt >= today
    ).length

    const todayViews = await prisma.blogView.count({
      where: {
        blogId: { in: posts.map(p => p.id) },
        createdAt: { gte: today }
      }
    })

    const todayVotes = await prisma.blogVote.count({
      where: {
        blogId: { in: posts.map(p => p.id) },
        createdAt: { gte: today }
      }
    })

    // Calculate yesterday's stats
    const yesterdayPosts = posts.filter(post => 
      post.createdAt >= yesterday && post.createdAt < today
    ).length

    const yesterdayViews = await prisma.blogView.count({
      where: {
        blogId: { in: posts.map(p => p.id) },
        createdAt: {
          gte: yesterday,
          lt: today
        }
      }
    })

    const yesterdayVotes = await prisma.blogVote.count({
      where: {
        blogId: { in: posts.map(p => p.id) },
        createdAt: {
          gte: yesterday,
          lt: today
        }
      }
    })

    // Calculate monthly stats
    const monthlyPosts = posts.filter(post => 
      post.createdAt >= monthStart
    ).length

    return NextResponse.json({
      totalPosts,
      totalViews,
      totalVotes,
      todayPosts,
      todayViews,
      todayVotes,
      yesterdayPosts,
      yesterdayViews,
      yesterdayVotes,
      monthlyPosts,
    })

  } catch (error) {
    console.error("[BLOG_STATS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 