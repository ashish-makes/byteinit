/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch recent likes on user's resources
    const recentLikes = await prisma.resourceInteraction.findMany({
      where: {
        type: 'LIKE',
        resource: {
          userId: session.user.id
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        resource: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Fetch recent saves of user's resources
    const recentSaves = await prisma.savedResource.findMany({
      where: {
        resource: {
          userId: session.user.id
        },
        userId: {
          not: session.user.id
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        resource: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      },
      take: 10
    })

    // Combine and sort activities
    const activities = [
      ...recentLikes.map(like => ({
        id: like.id,
        type: 'like',
        userName: like.user.name,
        resourceTitle: like.resource.title,
        timestamp: like.createdAt
      })),
      ...recentSaves.map(save => ({
        id: save.id,
        type: 'save',
        userName: save.user.name,
        resourceTitle: save.resource.title,
        timestamp: save.savedAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10)

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
} 