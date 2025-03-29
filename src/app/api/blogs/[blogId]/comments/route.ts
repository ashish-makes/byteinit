import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, parentId } = await req.json();

    // Get the blog to check ownership
    const blog = await prisma.blog.findUnique({
      where: { id: params.blogId },
      select: { userId: true },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        blogId: params.blogId,
        userId: session.user.id,
        parentId,
      },
    });

    // Create notification for blog owner
    if (blog.userId !== session.user.id) {
      await createNotification({
        userId: blog.userId,
        actionUserId: session.user.id,
        type: 'BLOG_COMMENT',
        blogId: params.blogId,
        commentId: comment.id,
      });
    }

    // If this is a reply, create notification for the parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });

      if (parentComment && parentComment.userId !== session.user.id) {
        await createNotification({
          userId: parentComment.userId,
          actionUserId: session.user.id,
          type: 'BLOG_COMMENT',
          blogId: params.blogId,
          commentId: comment.id,
        });
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 