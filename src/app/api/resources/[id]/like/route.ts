import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { InteractionType } from '@prisma/client';
import { createNotification } from '@/lib/notifications';

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: resourceId } = await context.params;
  const userId = session.user.id;

  try {
    const existingLike = await prisma.resourceInteraction.findUnique({
      where: {
        resourceId_userId_type: {
          resourceId,
          userId,
          type: InteractionType.LIKE,
        },
      },
    });

    // Count total likes for the resource
    const likes = await prisma.resourceInteraction.count({
      where: {
        resourceId,
        type: InteractionType.LIKE,
      },
    });

    return NextResponse.json({ 
      liked: !!existingLike,
      likes 
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check like status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the resource to check ownership
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Create or update interaction
    const interaction = await prisma.resourceInteraction.upsert({
      where: {
        resourceId_userId_type: {
          resourceId: params.id,
          userId: session.user.id,
          type: 'LIKE',
        },
      },
      update: {},
      create: {
        resourceId: params.id,
        userId: session.user.id,
        type: 'LIKE',
      },
    });

    // Update resource likes count
    await prisma.resource.update({
      where: { id: params.id },
      data: { likes: { increment: 1 } },
    });

    // Create notification for resource owner
    if (resource.userId !== session.user.id) {
      await createNotification({
        userId: resource.userId,
        actionUserId: session.user.id,
        type: 'RESOURCE_LIKE',
        resourceId: params.id,
      });
    }

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error liking resource:', error);
    return NextResponse.json(
      { error: 'Failed to like resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the resource to check ownership
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Delete interaction
    await prisma.resourceInteraction.delete({
      where: {
        resourceId_userId_type: {
          resourceId: params.id,
          userId: session.user.id,
          type: 'LIKE',
        },
      },
    });

    // Update resource likes count
    await prisma.resource.update({
      where: { id: params.id },
      data: { likes: { decrement: 1 } },
    });

    // Delete notification if it exists
    if (resource.userId !== session.user.id) {
      await prisma.notification.deleteMany({
        where: {
          resourceId: params.id,
          userId: resource.userId,
          actionUserId: session.user.id,
          type: 'RESOURCE_LIKE',
        },
      });
    }

    return NextResponse.json({ message: 'Resource unliked' });
  } catch (error) {
    console.error('Error unliking resource:', error);
    return NextResponse.json(
      { error: 'Failed to unlike resource' },
      { status: 500 }
    );
  }
}
