import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { NextResponse, NextRequest } from "next/server"

export async function POST(request: NextRequest, context: any) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { emoji } = await request.json()
    // Assert that params has the correct shape
    const { commentId } = context.params as { commentId: string }

    // Check if reaction already exists
    const existingReaction = await prisma.commentReaction.findFirst({
      where: {
        commentId,
        userId: session.user.id,
        emoji,
      },
    })

    if (existingReaction) {
      // Remove reaction if it exists
      await prisma.commentReaction.delete({
        where: {
          id: existingReaction.id,
        },
      })
    } else {
      // Add new reaction
      await prisma.commentReaction.create({
        data: {
          emoji,
          userId: session.user.id,
          commentId,
        },
      })
    }

    // Get all reactions for the comment after update
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    // Return both the reactions array and the count
    return NextResponse.json({
      reactions:
        updatedComment?.reactions.map((reaction) => ({
          id: reaction.id,
          emoji: reaction.emoji,
          userId: reaction.userId,
          user: reaction.user,
        })) || [],
      _count: {
        reactions: updatedComment?.reactions.length || 0,
      },
    })
  } catch (error) {
    console.error("Error handling reaction:", error)
    return NextResponse.json(
      { error: "Failed to handle reaction" },
      { status: 500 }
    )
  }
}
