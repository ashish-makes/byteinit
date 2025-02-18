import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { type NextRequest, NextResponse } from "next/server"

// Updated GET request handler for Next.js 15
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const post = await prisma.blog.findUnique({
    where: {
      slug: slug,
      userId: session.user.id,
    },
    include: {
      user: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          saves: true,
          views: true,
          votes: true,
        },
      },
      likes: true,
      saves: true,
      votes: true,
    },
  })

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  return NextResponse.json(post)
}

// Updated PATCH request handler for Next.js 15
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    await prisma.blog.update({
      where: {
        slug: slug,
        userId: session.user.id,
      },
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        summary: body.summary,
        coverImage: body.coverImage,
        tags: body.tags,
        published: body.published,
      },
    })

    return NextResponse.json(
      { message: "Post updated successfully" },
      {
        headers: {
          Location: "/dashboard/blog",
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Updated DELETE request handler for Next.js 15
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.blog.delete({
      where: {
        slug: slug,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

