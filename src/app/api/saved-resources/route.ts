/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { resourceId } = await req.json()

    // Validate resourceId
    if (!resourceId) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        userId: true,
        title: true,
      },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Check if the resource is already saved by the user
    const existingSave = await prisma.savedResource.findFirst({
      where: {
        userId: session.user.id,
        resourceId,
      },
    })

    if (existingSave) {
      return NextResponse.json({ error: "Resource already saved" }, { status: 400 })
    }

    // Perform transaction
    const transactionResult = await prisma.$transaction(async (prisma) => {
      // Increment the saves counter
      await prisma.resource.update({
        where: { id: resourceId },
        data: { saves: { increment: 1 } }
      });

      // Create notification if needed
      let notification;
      if (resource.userId !== session.user.id) {
        notification = await prisma.notification.create({
          data: {
            userId: resource.userId,
            resourceId,
            actionUserId: session.user.id,
            type: "SAVE",
            message: `saved your resource "${resource.title}"`,
            read: false,
          },
        })
      }

      // Create saved resource
      const savedResource = await prisma.savedResource.create({
        data: {
          userId: session.user.id,
          resourceId,
        },
        include: {
          resource: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      })

      return { savedResource, notification }
    })

    // Verify transaction result
    if (!transactionResult.savedResource) {
      console.error("No saved resource created")
      return NextResponse.json({ error: "Failed to save resource" }, { status: 500 })
    }

    // Safely serialize the saved resource
    const serializableSavedResource = JSON.parse(JSON.stringify(
      transactionResult.savedResource, 
      (key, value) => {
        if (typeof value === "bigint") return value.toString()
        if (value instanceof Date) return value.toISOString()
        return value
      }
    ))

    return NextResponse.json(serializableSavedResource, { status: 201 })
  } catch (error) {
    console.error("Error saving resource:", error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json({ 
      error: error instanceof Error 
        ? error.message 
        : "Failed to save resource",
      details: error instanceof Error ? error.name : undefined
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const resourceId = searchParams.get("resourceId")

  // Add a check to ensure resourceId is present
  if (!resourceId) {
    return NextResponse.json({ error: "Resource ID is required" }, { status: 400 })
  }

  try {
    // Find the saved resource before deleting to potentially remove associated notification
    const savedResource = await prisma.savedResource.findFirst({
      where: {
        userId: session.user.id,
        resourceId: resourceId,
      },
      include: {
        resource: {
          select: {
            userId: true,
            title: true,
          },
        },
      },
    })

    if (!savedResource) {
      return NextResponse.json({ error: "Saved resource not found" }, { status: 404 })
    }

    // Delete the saved resource and decrement the saves counter
    await prisma.$transaction([
      prisma.savedResource.deleteMany({
        where: {
          userId: session.user.id,
          resourceId: resourceId,
        },
      }),
      prisma.resource.update({
        where: { id: resourceId },
        data: { saves: { decrement: 1 } }
      }),
      // Remove the save notification if it exists
      prisma.notification.deleteMany({
        where: {
          resourceId: resourceId,
          userId: savedResource.resource.userId,
          actionUserId: session.user.id,
          type: "SAVE",
        },
      }),
    ])

    return NextResponse.json({ message: "Resource unsaved" }, { status: 200 })
  } catch (error) {
    console.error("Error unsaving resource:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to unsave resource" 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const savedResources = await prisma.savedResource.findMany({
      where: { userId: session.user.id },
      include: {
        resource: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })
    return NextResponse.json(savedResources, { status: 200 })
  } catch (error) {
    console.error("Error fetching saved resources:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch saved resources" 
    }, { status: 500 })
  }
}