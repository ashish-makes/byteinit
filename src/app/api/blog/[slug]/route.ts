import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { type NextRequest, NextResponse } from "next/server"

interface CommentUser {
  id: string
  name: string | null
  image: string | null
  username: string | null
}

interface CommentReaction {
  id: string
  emoji: string
  userId: string
  commentId: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface PrismaComment {
  id: string
  content: string
  createdAt: Date
  user: CommentUser
  reactions: CommentReaction[]
  replies: PrismaComment[]
  parentId: string | null
}

interface TransformedReaction {
  emoji: string
  userId: string
  count: number
  users: Array<{
    id: string
    name: string | null
    image: string | null
  }>
}

interface TransformedComment {
  id: string
  content: string
  createdAt: Date
  user: CommentUser
  reactions: TransformedReaction[]
  replies: TransformedComment[]
  parentId: string | null
}

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
    },
    include: {
      user: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
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
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  username: true,
                },
              },
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
          },
        },
      },
      _count: true,
      likes: true,
      saves: true,
      votes: true,
    },
  })

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  // Transform comment reactions
  const transformReactions = (reactions: CommentReaction[]): TransformedReaction[] => {
    const reactionGroups = reactions.reduce<Record<string, TransformedReaction>>((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          userId: reaction.userId,
          count: 0,
          users: []
        }
      }
      acc[reaction.emoji].count++
      acc[reaction.emoji].users.push({
        id: reaction.user.id,
        name: reaction.user.name,
        image: reaction.user.image
      })
      return acc
    }, {})

    return Object.values(reactionGroups)
  }

  // Transform comments recursively
  const transformComments = (comments: (PrismaComment | any)[]): TransformedComment[] => {
    return comments.map(comment => {
      // Ensure reactions is always an array
      const reactions = Array.isArray(comment.reactions) ? comment.reactions : [];
      const replies = Array.isArray(comment.replies) ? comment.replies : [];

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: comment.user,
        reactions: transformReactions(reactions),
        replies: transformComments(replies),
        parentId: comment.parentId
      }
    })
  }

  const transformedComments = transformComments(post.comments)

  return NextResponse.json({
    ...post,
    comments: transformedComments,
  })
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

