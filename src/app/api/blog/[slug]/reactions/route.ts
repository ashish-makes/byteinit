import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: { slug: string } }
) {
  try {
    // Await the params to resolve the dynamic route parameter
    const params = await context.params;
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ error: "Blog slug is required" }, { status: 400 })
    }

    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const [reactions, userReactions] = await Promise.all([
      prisma.blogReaction.groupBy({
        by: ['emoji'],
        where: { blogId: blog.id },
        _count: true
      }),
      prisma.blogReaction.findMany({
        where: { blogId: blog.id },
        select: {
          emoji: true,
          userId: true
        }
      })
    ])

    return NextResponse.json({ reactions, userReactions })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: { slug: string } }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Await the params to resolve the dynamic route parameter
    const params = await context.params;
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ error: "Blog slug is required" }, { status: 400 })
    }

    const { emoji } = await request.json()

    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const existingReaction = await prisma.blogReaction.findFirst({
      where: {
        blogId: blog.id,
        userId: session.user.id,
        emoji
      }
    })

    let result
    if (existingReaction) {
      await prisma.blogReaction.delete({
        where: { id: existingReaction.id }
      })
      result = { removed: true }
    } else {
      await prisma.blogReaction.create({
        data: {
          emoji,
          userId: session.user.id,
          blogId: blog.id
        }
      })
      result = { added: true }
    }

    // Fetch updated reactions
    const [reactions, userReactions] = await Promise.all([
      prisma.blogReaction.groupBy({
        by: ['emoji'],
        where: { blogId: blog.id },
        _count: true
      }),
      prisma.blogReaction.findMany({
        where: { blogId: blog.id },
        select: {
          emoji: true,
          userId: true
        }
      })
    ])

    return NextResponse.json({
      ...result,
      reactions: reactions.map(r => ({ emoji: r.emoji, _count: r._count })),
      userReactions
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 })
  }
} 