'use server'

import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { categorizeTopic } from '@/lib/topicMatcher'

// Define a type for the blog post that matches the Prisma return type
type BlogPost = {
  id: string;
  title: string;
  content: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;  // Allow null for userId
  featured: boolean;
  tags: string[];
  user: {
    name: string | null;
    image: string | null;
    username: string | null;
  } | null;
  _count: {
    votes: number;
    comments: number;
    saves: number;
    views: number;
  };
  votes: Array<{ id: string; userId: string | null; blogId: string; type: "UP" | "DOWN" }>;  // Allow null for userId
  saves: Array<{ id: string; userId: string | null; blogId: string; createdAt: Date }>;  // Allow null for userId
};

export async function toggleLike(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to like posts" }
  }

  try {
    // Fix the composite key issue by using AND condition instead
    const existingLike = await prisma.blogLike.findFirst({
      where: {
        AND: [
          { blogId },
          { userId: session.user.id }
        ]
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
    // Fix the composite key issue by using AND condition instead
    const existingSave = await prisma.blogSave.findFirst({
      where: {
        AND: [
          { blogId },
          { userId: session.user.id }
        ]
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
    // Fix the composite key issue by using AND condition instead
    const existingVote = await prisma.blogVote.findFirst({
      where: {
        AND: [
          { blogId },
          { userId: session.user.id }
        ]
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
  try {
    const session = await auth()
    
    // Check if view already exists for this user/IP today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Only record view if user is logged in
    if (session?.user?.id) {
      const existingView = await prisma.blogView.findFirst({
        where: {
          blogId,
          userId: session.user.id,
          createdAt: {
            gte: today
          }
        }
      })

      if (!existingView) {
        await prisma.blogView.create({
          data: {
            blogId,
            userId: session.user.id,
          },
        })
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error recording view:', error);
    // Return success anyway to prevent breaking the page load
    return { success: false, error: 'Failed to record view' };
  }
}

export async function getBlogPosts(
  section: "hot" | "latest" | "popular" | "best" | "featured" | "following" | null = null,
  topic?: string
) {
  try {
    const session = await auth();
    
    // Ensure section has a default value if null
    const activeSection = section || "latest";
    
    // Base query with better null handling
    const baseWhere = {
      published: true,
      ...(topic ? {
        OR: [
          {
            tags: {
              hasSome: [
                topic.toLowerCase(),
                topic.toUpperCase(),
                topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase()
              ]
            }
          },
          {
            AND: [
              {
                OR: [
                  { title: { contains: topic, mode: 'insensitive' as const } },
                  { content: { contains: topic, mode: 'insensitive' as const } },
                  // Special case for AI
                  ...(topic === 'artificial-intelligence' ? [
                    { title: { contains: 'ai', mode: 'insensitive' as const } },
                    { content: { contains: 'ai', mode: 'insensitive' as const } },
                    { title: { contains: 'a.i', mode: 'insensitive' as const } },
                    { content: { contains: 'a.i', mode: 'insensitive' as const } }
                  ] : [])
                ]
              }
            ]
          }
        ]
      } : {}),
      ...(activeSection === 'following' && session?.user?.id ? {
        userId: {
          in: await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { followingIds: true }
          }).then(user => user?.followingIds || [])
        }
      } : {})
    }

    let orderBy: any;
    
    switch (activeSection) {
      case 'featured':
        return {
          items: await prisma.blog.findMany({
            where: {
              ...baseWhere,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            },
            orderBy: [
              { votes: { _count: 'desc' as const }},
              { comments: { _count: 'desc' as const }},
              { views: { _count: 'desc' as const }}
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
          featured: []
        }
      case 'latest':
        orderBy = { createdAt: 'desc' as const };
        break;
      case 'popular':
        orderBy = [
          { views: { _count: 'desc' as const }},
          { createdAt: 'desc' as const }
        ];
        break;
      case 'best':
        orderBy = [
          { votes: { _count: 'desc' as const }},
          { createdAt: 'desc' as const }
        ];
        break;
      case 'hot':
      default:
        // Hot is a combination of recent + engagement
        orderBy = [
          { votes: { _count: 'desc' as const }},
          { comments: { _count: 'desc' as const }},
          { createdAt: 'desc' as const }
        ];
        break;
    }

    // Get posts with proper error handling
    try {
      const posts = await prisma.blog.findMany({
        where: baseWhere,
        orderBy,
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
      });

      // Get featured posts for all sections, not just hot
      let featured: BlogPost[] = [];
      try {
        featured = await prisma.blog.findMany({
          where: {
            ...baseWhere,
            featured: true,
          },
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
          take: 3,
        });
      } catch (featuredError) {
        console.error('Error fetching featured posts:', featuredError);
        // Continue with empty featured posts rather than failing
        featured = [];
      }

      return {
        items: posts,
        featured: featured
      };
    } catch (postsError) {
      console.error('Error fetching posts:', postsError);
      // Return empty arrays instead of failing
      return {
        items: [],
        featured: []
      };
    }
  } catch (error) {
    console.error('[BLOG_GET]', error);
    // Return empty data instead of throwing an error
    return {
      items: [],
      featured: []
    };
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
    // Fix the composite key issue by using AND condition instead
    const existingSave = await prisma.blogSave.findFirst({
      where: {
        AND: [
          { blogId: postId },
          { userId: session.user.id }
        ]
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

export async function addComment(postId: string, content: string, parentId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to comment" };
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        blogId: postId,
        parentId
      },
      include: {
        user: true,
        reactions: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            reactions: true,
            replies: true
          }
        }
      }
    });

    // Ensure user is not null before accessing its properties
    if (!comment.user) {
      return { error: "Failed to create comment with user data" };
    }

    const serializedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        image: comment.user.image,
        username: comment.user.username
      },
      reactions: [],
      replies: [],
      _count: {
        reactions: 0,
        replies: 0
      }
    };

    revalidatePath('/blog/[slug]', 'page');
    return { 
      success: true, 
      comment: serializedComment
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { error: "Failed to add comment" };
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
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    const existingReaction = await prisma.commentReaction.findFirst({
      where: {
        commentId,
        userId: session.user.id,
        emoji
      }
    })

    if (existingReaction) {
      await prisma.commentReaction.delete({
        where: { id: existingReaction.id }
      })
    } else {
      await prisma.commentReaction.create({
        data: {
          emoji,
          commentId,
          userId: session.user.id
        }
      })
    }

    // Fetch updated reactions
    const updatedComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        _count: {
          select: {
            reactions: true
          }
        }
      }
    })

    if (!updatedComment) {
      throw new Error('Comment not found')
    }

    return {
      reactions: updatedComment.reactions.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        userId: reaction.userId,
        user: reaction.user
      })),
      _count: {
        reactions: updatedComment._count.reactions
      }
    }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return { error: 'Failed to toggle reaction' }
  }
}

export async function createPost(data: any) {
  try {
    const { title, content, tags = [] } = data;
    
    // Auto-categorize the post
    const autoTags = categorizeTopic(title, content, tags);
    const finalTags = [...new Set([...tags, ...autoTags])];

    const post = await prisma.blog.create({
      data: {
        ...data,
        tags: finalTags
      }
    });

    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function toggleFollow(userIdToFollow: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Please sign in to follow users" }
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { followingIds: true }
    })

    if (!currentUser) {
      return { error: "User not found" }
    }

    const isFollowing = currentUser.followingIds.includes(userIdToFollow)

    // Update both users' following/follower lists
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        followingIds: isFollowing
          ? { set: currentUser.followingIds.filter(id => id !== userIdToFollow) }
          : { push: userIdToFollow }
      }
    })

    await prisma.user.update({
      where: { id: userIdToFollow },
      data: {
        followerIds: isFollowing
          ? { set: (await prisma.user.findUnique({
              where: { id: userIdToFollow },
              select: { followerIds: true }
            }))?.followerIds.filter(id => id !== session.user.id) || [] }
          : { push: session.user.id }
      }
    })

    revalidatePath('/blog/following')
    return { success: true, isFollowing: !isFollowing }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return { error: "Failed to update follow status" }
  }
} 