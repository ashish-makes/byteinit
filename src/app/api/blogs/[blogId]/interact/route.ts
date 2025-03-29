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
    const { type } = await req.json();

    // Get the blog to check ownership
    const blog = await prisma.blog.findUnique({
      where: { id: params.blogId },
      select: { userId: true },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Create or update interaction
    const interaction = await prisma.blogInteraction.upsert({
      where: {
        blogId_userId_type: {
          blogId: params.blogId,
          userId: session.user.id,
          type,
        },
      },
      update: {},
      create: {
        blogId: params.blogId,
        userId: session.user.id,
        type,
      },
    });

    // Update blog stats based on interaction type
    switch (type) {
      case 'LIKE':
        await prisma.blog.update({
          where: { id: params.blogId },
          data: { likes: { increment: 1 } },
        });
        break;
      case 'SAVE':
        await prisma.blog.update({
          where: { id: params.blogId },
          data: { saves: { increment: 1 } },
        });
        break;
      case 'VOTE':
        await prisma.blog.update({
          where: { id: params.blogId },
          data: { votes: { increment: 1 } },
        });
        break;
    }

    // Create notification for blog owner
    if (blog.userId !== session.user.id) {
      let notificationType;
      switch (type) {
        case 'LIKE':
          notificationType = 'BLOG_LIKE';
          break;
        case 'SAVE':
          notificationType = 'BLOG_SAVE';
          break;
        case 'VOTE':
          notificationType = 'BLOG_VOTE';
          break;
        default:
          notificationType = 'BLOG_LIKE';
      }

      await createNotification({
        userId: blog.userId,
        actionUserId: session.user.id,
        type: notificationType,
        blogId: params.blogId,
      });
    }

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error interacting with blog:', error);
    return NextResponse.json(
      { error: 'Failed to interact with blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type } = await req.json();

    // Get the blog to check ownership
    const blog = await prisma.blog.findUnique({
      where: { id: params.blogId },
      select: { userId: true },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Delete interaction
    await prisma.blogInteraction.delete({
      where: {
        blogId_userId_type: {
          blogId: params.blogId,
          userId: session.user.id,
          type,
        },
      },
    });

    // Update blog stats based on interaction type
    switch (type) {
      case 'LIKE':
        await prisma.blog.update({
          where: { id: params.blogId },
          data: { likes: { decrement: 1 } },
        });
        break;
      case 'SAVE':
        await prisma.blog.update({
          where: { id: params.blogId },
          data: { saves: { decrement: 1 } },
        });
        break;
      case 'VOTE':
        await prisma.blog.update({
          where: { id: params.blogId },
          data: { votes: { decrement: 1 } },
        });
        break;
    }

    // Delete notification if it exists
    if (blog.userId !== session.user.id) {
      let notificationType;
      switch (type) {
        case 'LIKE':
          notificationType = 'BLOG_LIKE';
          break;
        case 'SAVE':
          notificationType = 'BLOG_SAVE';
          break;
        case 'VOTE':
          notificationType = 'BLOG_VOTE';
          break;
        default:
          notificationType = 'BLOG_LIKE';
      }

      await prisma.notification.deleteMany({
        where: {
          blogId: params.blogId,
          userId: blog.userId,
          actionUserId: session.user.id,
          type: notificationType,
        },
      });
    }

    return NextResponse.json({ message: 'Blog interaction removed' });
  } catch (error) {
    console.error('Error removing blog interaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove blog interaction' },
      { status: 500 }
    );
  }
} 