import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { z } from "zod"

const resourceUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  url: z.string().url("Please enter a valid URL").optional(),
  type: z.enum([
    "LIBRARY",
    "TOOL",
    "FRAMEWORK",
    "TUTORIAL",
    "TEMPLATE",
    "ICON_SET",
    "ILLUSTRATION",
    "COMPONENT_LIBRARY",
    "CODE_SNIPPET",
    "API",
    "DOCUMENTATION",
    "COURSE",
    "OTHER"
  ]).optional(),
  category: z.enum([
    "FRONTEND",
    "BACKEND",
    "FULLSTACK",
    "DEVOPS",
    "MOBILE",
    "AI_ML",
    "DATABASE",
    "SECURITY",
    "UI_UX",
    "DESIGN",
    "MACHINE_LEARNING",
    "CLOUD",
    "OTHER"
  ]).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object to get the id
    const resolvedParams = await params
    const id = resolvedParams.id

    // Ensure authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`Attempting to fetch resource with ID: ${id}`) // Debugging log
    console.log(`User ID from session: ${session.user.id}`) // Debugging log

    const resource = await prisma.resource.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!resource) {
      console.log(`Resource not found or unauthorized`) // Debugging log
      return NextResponse.json({ error: "Resource not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch resource",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object to get the id
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)

    const validatedData = resourceUpdateSchema.parse(body)
    console.log("Validated data:", validatedData)

    const existingResource = await prisma.resource.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingResource) {
      return NextResponse.json({ error: "Resource not found or unauthorized" }, { status: 404 })
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        ...validatedData,
      },
    })

    return NextResponse.json(updatedResource, { status: 200 })
  } catch (error) {
    console.error("Resource update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update resource",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object to get the id
    const resolvedParams = await params
    const id = resolvedParams.id

    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deletedResource = await prisma.resource.delete({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        message: "Resource deleted successfully",
        deletedResourceId: deletedResource.id,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Resource deletion error:", error)

    return NextResponse.json(
      {
        error: "Failed to delete resource",
        details: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

