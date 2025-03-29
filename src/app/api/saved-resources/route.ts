/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
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

    // Create or update saved resource
    const savedResource = await prisma.savedResource.upsert({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId: resourceId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        resourceId: resourceId,
      },
    });

    // Create notification for resource owner
    if (resource.userId !== session.user.id) {
      await createNotification({
        userId: resource.userId,
        actionUserId: session.user.id,
        type: 'RESOURCE_SAVE',
        resourceId: resourceId,
      });
    }

    return NextResponse.json(savedResource);
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const resourceId = searchParams.get("resourceId")

  // Add a check to ensure resourceId is present
  if (!resourceId) {
    return NextResponse.json({ error: "Resource ID is required" }, { status: 400 })
  }

  try {
    // Get the resource to check ownership
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { userId: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Delete saved resource
    await prisma.savedResource.delete({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId: resourceId,
        },
      },
    });

    // Delete notification if it exists
    if (resource.userId !== session.user.id) {
      await prisma.notification.deleteMany({
        where: {
          resourceId: resourceId,
          userId: resource.userId,
          actionUserId: session.user.id,
          type: 'RESOURCE_SAVE',
        },
      });
    }

    return NextResponse.json({ message: 'Resource unsaved' });
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