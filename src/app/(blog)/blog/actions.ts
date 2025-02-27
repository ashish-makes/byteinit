'use server'

import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleLike(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to like posts" }
  }

  try {
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        blogId_userId: {
          blogId,
          userId: session.user.id,
        },
      },
    })

    if (existingLike) {
      await prisma.blogLike.delete({
        where: { id: existingLike.id },
      })
    } else {
      await prisma.blogLike.create({
        data: {
          blogId,
          userId: session.user.id,
        },
      })
    }

    revalidatePath('/blog/[slug]')
    return { success: true }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { error: "Failed to like post" }
  }
}

export async function toggleSave(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to save posts" }
  }

  try {
    const existingSave = await prisma.blogSave.findUnique({
      where: {
        blogId_userId: {
          blogId,
          userId: session.user.id,
        },
      },
    })

    if (existingSave) {
      await prisma.blogSave.delete({
        where: { id: existingSave.id },
      })
    } else {
      await prisma.blogSave.create({
        data: {
          blogId,
          userId: session.user.id,
        },
      })
    }

    revalidatePath('/blog/[slug]')
    return { success: true }
  } catch (error) {
    console.error('Error toggling save:', error)
    return { error: "Failed to save post" }
  }
}

export async function vote(blogId: string, voteType: 'UP' | 'DOWN') {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to vote" }
  }

  try {
    const existingVote = await prisma.blogVote.findUnique({
      where: {
        blogId_userId: {
          blogId,
          userId: session.user.id,
        },
      },
    })

    if (existingVote) {
      if (existingVote.type === voteType) {
        await prisma.blogVote.delete({
          where: { id: existingVote.id },
        })
      } else {
        await prisma.blogVote.update({
          where: { id: existingVote.id },
          data: { type: voteType },
        })
      }
    } else {
      await prisma.blogVote.create({
        data: {
          blogId,
          userId: session.user.id,
          type: voteType,
        },
      })
    }

    revalidatePath('/blog/[slug]')
    return { success: true }
  } catch (error) {
    console.error('Error voting:', error)
    return { error: "Failed to vote" }
  }
}

export async function recordView(blogId: string) {
  const session = await auth()
  
  // Check if view already exists for this user/IP today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const existingView = await prisma.blogView.findFirst({
    where: {
      blogId,
      userId: session?.user?.id,
      createdAt: {
        gte: today
      }
    }
  })

  if (!existingView) {
    await prisma.blogView.create({
      data: {
        blogId,
        userId: session?.user?.id,
      },
    })
  }
}

export async function getBlogPosts(section: "hot" | "latest" | "popular" | null = 'hot') {
  try {
    console.log('Fetching posts for section:', section)
    
    const baseWhere = {
      published: true,
    }

    // Get posts based on section
    const [posts, featured] = await Promise.all([
      prisma.blog.findMany({
        where: baseWhere,
        orderBy: section === 'latest' 
          ? { createdAt: 'desc' }
          : section === 'popular'
          ? [
              {
                views: {
                  _count: 'desc',
                },
              },
              { createdAt: 'desc' },
            ]
          : [ // hot (default)
              {
                votes: {
                  _count: 'desc',
                },
              },
              { createdAt: 'desc' },
            ],
        include: {
          user: {
            select: {
              name: true,
              image: true,
              username: true,
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true,
              saves: true,
              views: true,
            }
          },
          votes: true,
          saves: true,
        },
        take: 20,
      }),
      // Featured posts - most engaged posts in the last week
      prisma.blog.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: [
          {
            votes: {
              _count: 'desc',
            },
          },
          {
            comments: {
              _count: 'desc',
            },
          },
          {
            views: {
              _count: 'desc',
            },
          },
        ],
        include: {
          user: {
            select: {
              name: true,
              image: true,
              username: true,
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true,
              saves: true,
              views: true,
            }
          },
          votes: true,
          saves: true,
        },
        take: 6,
      })
    ])

    console.log('Found posts:', posts.length)
    console.log('Sample post:', posts[0])

    return {
      items: posts,
      featured,
    }
  } catch (error) {
    console.error('[GET_BLOG_POSTS] Error:', error)
    throw new Error('Failed to fetch blog posts')
  }
}

export async function removeFromHistory(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  await prisma.blogView.deleteMany({
    where: {
      blogId,
      userId: session.user.id,
    },
  })

  revalidatePath('/blog/history')
}

export async function clearHistory() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  await prisma.blogView.deleteMany({
    where: {
      userId: session.user.id,
    },
  })

  revalidatePath('/blog/history')
}

export async function searchPosts(query: string) {
  try {
    // Normalize the search query
    const searchTerms = query.toLowerCase().trim().split(/\s+/);

    const posts = await prisma.blog.findMany({
      where: {
        published: true,
        OR: [
          // Search in title
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Search in content
          {
            content: {
              contains: query,
              mode: 'insensitive',
            },
          },
          // Search in tags
          {
            tags: {
              hasEvery: [query],
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        tags: true,
        summary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Add debug logging
    console.log('Search query:', query);
    console.log('Found posts:', posts.length);

    return posts;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function savePost(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to save posts" }
  }

  try {
    const existingSave = await prisma.blogSave.findUnique({
      where: {
        blogId_userId: {
          blogId: postId,
          userId: session.user.id,
        },
      },
    })

    if (existingSave) {
      await prisma.blogSave.delete({
        where: { id: existingSave.id },
      })
    } else {
      await prisma.blogSave.create({
        data: {
          blogId: postId,
          userId: session.user.id,
        },
      })
    }

    revalidatePath('/blog/[slug]')
    return { success: true }
  } catch (error) {
    console.error('Error saving post:', error)
    return { error: "Failed to save post" }
  }
}

export async function addComment(blogId: string, content: string, parentId?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to comment" }
  }

  try {
    await prisma.comment.create({
      data: {
        content,
        blogId,
        userId: session.user.id,
        parentId: parentId || null,
      },
    })

    revalidatePath('/blog/[slug]')
    return { success: true }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { error: "Failed to add comment" }
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Unauthorized" }
    }

    // First verify the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        replies: true
      }
    })

    if (!comment) {
      return { error: "Comment not found" }
    }

    if (comment.userId !== session.user.id) {
      return { error: "Not authorized to delete this comment" }
    }

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Recursive function to delete comments and their replies
      async function deleteCommentAndReplies(id: string) {
        const replies = await tx.comment.findMany({
          where: { parentId: id },
          select: { id: true }
        })

        // Delete reactions for this comment
        await tx.commentReaction.deleteMany({
          where: { commentId: id }
        })

        // Recursively delete all replies
        for (const reply of replies) {
          await deleteCommentAndReplies(reply.id)
        }

        // Delete the comment itself
        await tx.comment.delete({
          where: { id }
        })
      }

      // Start the recursive deletion
      await deleteCommentAndReplies(commentId)
    })

    revalidatePath('/blog/[slug]')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to delete comment" }
  }
}

export async function editComment(commentId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in" }
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    })

    if (!comment || comment.userId !== session.user.id) {
      return { error: "Not authorized" }
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { content }
    })

    revalidatePath('/blog/[slug]')
    return { success: true }
  } catch (error) {
    console.error('Error editing comment:', error)
    return { error: "Failed to edit comment" }
  }
}

export async function toggleCommentReaction(commentId: string, emoji: string) {
  try {
    const response = await fetch(`/api/comments/${commentId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    });
    const data = await response.json();
    return {
      reactions: data.reactions,
      _count: { reactions: data._count.reactions }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      reactions: [],
      _count: { reactions: 0 }
    };
  }
} 