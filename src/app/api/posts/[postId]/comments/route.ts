import { auth } from "../../../../../auth"
import { prisma } from "../../../../../prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const comments = await prisma.comment.findMany({
      where: {
        blogId: postId,
        parentId: null
      },
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
              }
            }
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              }
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  }
                }
              }
            }
          }
        }
      },
     orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedComments = comments.map(comment => ({
      ...comment,
      _count: {
        reactions: comment.reactions.length,
        replies: comment.replies.length
      },
      replies: comment.replies.map(reply => ({
        ...reply,
        _count: {
          reactions: reply.reactions.length,
          replies: 0
        }
      }))
    }))

    return NextResponse.json({
      comments: transformedComments,
      commentCount: await prisma.comment.count({
        where: { blogId: postId }
      })
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { content, parentId } = await request.json()

    console.log('Creating comment:', {
      content,
      parentId,
      postId,
      userId: session.user.id
    });

    const comment = await prisma.comment.create({
      data: {
        content,
        blogId: postId,
        userId: session.user.id,
        parentId: parentId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        },
        _count: {
          select: {
            reactions: true,
            replies: true
          }
        }
      }
    })

    console.log('Created comment:', comment);

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}