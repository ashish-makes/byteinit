import { NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const today = new Date(now.setHours(0, 0, 0, 0))
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get total saves (excluding self-saves)
    const totalSaves = await prisma.savedResource.count({
      where: {
        resource: {
          userId: session.user.id
        },
        userId: {
          not: session.user.id
        }
      }
    })

    // Get today's saves
    const todaySaves = await prisma.savedResource.count({
      where: {
        resource: {
          userId: session.user.id
        },
        userId: {
          not: session.user.id
        },
        savedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get yesterday's saves
    const yesterdaySaves = await prisma.savedResource.count({
      where: {
        resource: {
          userId: session.user.id
        },
        userId: {
          not: session.user.id
        },
        savedAt: {
          gte: yesterday,
          lt: today
        }
      }
    })

    return NextResponse.json({
      totalSaves: totalSaves || 0,
      todaySaves: todaySaves || 0,
      yesterdaySaves: yesterdaySaves || 0
    })
  } catch (error) {
    console.error("Error fetching saves stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch saves statistics" },
      { status: 500 }
    )
  }
} 