import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { NextResponse, NextRequest } from "next/server"

console.log('Route handler registered for /api/comments/[commentId]/reactions')

export async function POST(request: NextRequest, context: any) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { emoji } = await request.json()
    const { commentId } = context.params

    console.log('Creating reaction:', {
      commentId,
      userId: session.user.id,
      emoji
    })

    // First verify the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if reaction already exists
    const existingReaction = await prisma.commentReaction.findFirst({
      where: {
        commentId,
        userId: session.user.id,
        emoji,
      },
    })

    let result
    if (existingReaction) {
      console.log('Deleting existing reaction:', existingReaction.id)
      // Remove reaction if it exists
      result = await prisma.commentReaction.delete({
        where: {
          id: existingReaction.id,
        },
      })
    } else {
      console.log('Creating new reaction')
      // Add new reaction
      result = await prisma.commentReaction.create({
        data: {
          emoji,
          userId: session.user.id,
          commentId,
        },
      })
    }

    console.log('Operation result:', result)

    // Get updated reactions with user info
    const updatedReactions = await prisma.commentReaction.findMany({
      where: { commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      reactions: updatedReactions,
      _count: { reactions: updatedReactions.length }
    })
  } catch (error) {
    console.error("Error handling reaction:", error)
    return NextResponse.json({ 
      error: "Failed to handle reaction",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
