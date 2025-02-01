// app/api/resources/chart-data/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Extract the "range" query parameter (expected values: "7", "30", "180")
  const { searchParams } = new URL(req.url)
  const rangeParam = searchParams.get("range") || "30"
  // Convert to number of days; here "180" represents roughly 6 months.
  let days = parseInt(rangeParam, 10)
  if (![7, 30, 180].includes(days)) {
    // Default to 30 days if an unexpected value is provided.
    days = 30
  }
  
  const userId = session.user.id
  try {
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days)

    // Fetch resources and saved resources for the given time range
    const resources = await prisma.resource.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        createdAt: true,
        likes: true,
      },
    })

    const savedResources = await prisma.savedResource.findMany({
      where: {
        userId,
        savedAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        savedAt: true,
      },
    })

    // Aggregate data by date
    const dataByDate: Record<string, { likes: number; saves: number }> = {}

    for (let i = 0; i < days; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateString = date.toISOString().split("T")[0]
      dataByDate[dateString] = { likes: 0, saves: 0 }
    }

    resources.forEach((resource) => {
      const date = new Date(resource.createdAt).toISOString().split("T")[0]
      if (dataByDate[date]) {
        dataByDate[date].likes += resource.likes || 0
      }
    })

    savedResources.forEach((saved) => {
      const date = new Date(saved.savedAt).toISOString().split("T")[0]
      if (dataByDate[date]) {
        dataByDate[date].saves += 1
      }
    })

    // Convert aggregated data to an array for the chart and sort by date
    const chartData = Object.keys(dataByDate)
      .sort()
      .map((date) => ({
        date,
        likes: dataByDate[date].likes,
        saves: dataByDate[date].saves,
      }))

    console.log("Chart Data:", chartData)

    if (!chartData || !Array.isArray(chartData)) {
      throw new Error("Invalid chart data format")
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching chart data:", error)
    return NextResponse.json(
      { error: "Failed to fetch chart data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
