import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get userId, range, and timezone from URL params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const range = searchParams.get("range") || "30d"
    const timezone = searchParams.get("timezone") || "UTC"

    if (!userId) {
      return new NextResponse("Missing userId parameter", { status: 400 })
    }

    // Calculate date range in user's timezone
    const now = new Date()
    const userNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const startDate = new Date(userNow)

    switch (range) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "7d":
        startDate.setDate(userNow.getDate() - 7)
        break
      case "30d":
        startDate.setDate(userNow.getDate() - 30)
        break
      case "3m":
        startDate.setMonth(userNow.getMonth() - 3)
        break
      case "6m":
        startDate.setMonth(userNow.getMonth() - 6)
        break
      case "1y":
        startDate.setFullYear(userNow.getFullYear() - 1)
        break
      case "all":
        startDate.setTime(0) // Beginning of time
        break
      default:
        startDate.setDate(userNow.getDate() - 30) // Default to 30 days
    }

    // Convert dates back to UTC for database query
    const utcStartDate = new Date(startDate.toLocaleString('en-US', { timeZone: 'UTC' }))
    const utcEndDate = new Date(userNow.toLocaleString('en-US', { timeZone: 'UTC' }))

    // Get blogs with their views and all votes within the date range
    const blogs = await prisma.blog.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: utcStartDate,
          lte: utcEndDate,
        },
      },
      include: {
        views: true,
        votes: true, // Include all votes without filtering by type
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Generate daily data points in user's timezone
    const dailyData = []
    const iterDate = new Date(startDate)

    while (iterDate <= userNow) {
      const dateStr = iterDate.toISOString().split('T')[0]
      
      // Find blogs for this date
      const blogsForDay = blogs.filter(blog => {
        const blogDate = new Date(blog.createdAt).toISOString().split('T')[0]
        return blogDate === dateStr
      })

      // Calculate totals
      const views = blogsForDay.reduce((sum, blog) => sum + blog.views.length, 0)
      const votes = blogsForDay.reduce((sum, blog) => sum + blog.votes.length, 0)

      dailyData.push({
        date: dateStr,
        views,
        votes,
      })

      // Move to next day
      iterDate.setDate(iterDate.getDate() + 1)
    }

    console.log('API Response Data:', dailyData)
    return NextResponse.json(dailyData)

  } catch (error) {
    console.error("Error fetching blog chart data:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 