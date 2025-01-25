import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { InteractionType } from '@prisma/client';

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

    if (existingLike) {
      await prisma.$transaction([
        prisma.resourceInteraction.delete({
          where: {
            resourceId_userId_type: {
              resourceId,
              userId,
              type: InteractionType.LIKE,
            },
          },
        }),
        prisma.resource.update({
          where: { id: resourceId },
          data: { likes: { decrement: 1 } },
        }),
      ]);

      // Count total likes after unlike
      const likes = await prisma.resourceInteraction.count({
        where: {
          resourceId,
          type: InteractionType.LIKE,
        },
      });

      return NextResponse.json({ 
        liked: false, 
        likes,
        message: 'Like removed',
      });
    } else {
      await prisma.$transaction([
        prisma.resourceInteraction.create({
          data: {
            resourceId,
            userId,
            type: InteractionType.LIKE,
          },
        }),
        prisma.resource.update({
          where: { id: resourceId },
          data: { likes: { increment: 1 } },
        }),
      ]);

      // Count total likes after like
      const likes = await prisma.resourceInteraction.count({
        where: {
          resourceId,
          type: InteractionType.LIKE,
        },
      });

      return NextResponse.json({ 
        liked: true, 
        likes,
        message: 'Like added',
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { 
        error: 'Failed to toggle like', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
