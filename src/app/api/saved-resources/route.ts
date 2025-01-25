/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { resourceId } = await req.json();
  
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { 
        userId: true, 
        title: true 
      }
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Check if the resource is already saved by the user
    const existingSave = await prisma.savedResource.findFirst({
      where: {
        userId: session.user.id,
        resourceId
      }
    });

    if (existingSave) {
      return NextResponse.json({ error: 'Resource already saved' }, { status: 400 });
    }

    // Only create notification if the resource owner is different from the user saving it
    const savedResource = await prisma.$transaction([
      ...(resource.userId !== session.user.id ? [
        prisma.notification.create({
          data: {
            userId: resource.userId, // Send notification to resource owner
            resourceId,
            actionUserId: session.user.id,
            type: 'SAVE',
            message: `saved your resource "${resource.title}"`,
            read: false
          }
        })
      ] : []),
      prisma.savedResource.create({
        data: {
          userId: session.user.id,
          resourceId
        },
        include: {
          resource: true
        }
      })
    ]);
    return NextResponse.json(savedResource[1], { status: 201 });
  } catch (error) {
    console.error('Error saving resource:', error);
    return NextResponse.json({ error: 'Failed to save resource' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get('resourceId');
  
  try {
    // Find the saved resource before deleting to potentially remove associated notification
    const savedResource = await prisma.savedResource.findFirst({
      where: {
        userId: session.user.id,
        resourceId: resourceId || undefined
      },
      include: {
        resource: {
          select: {
            userId: true,
            title: true
          }
        }
      }
    });

    if (!savedResource) {
      return NextResponse.json({ error: 'Saved resource not found' }, { status: 404 });
    }

    // Delete the saved resource and optionally remove the associated notification
    await prisma.$transaction([
      prisma.savedResource.deleteMany({
        where: {
          userId: session.user.id,
          resourceId: resourceId || undefined
        }
      }),
      // Remove the save notification if it exists
      prisma.notification.deleteMany({
        where: {
          resourceId: resourceId || undefined,
          userId: savedResource.resource.userId,
          actionUserId: session.user.id,
          type: 'SAVE'
        }
      })
    ]);

    return NextResponse.json({ message: 'Resource unsaved' });
  } catch (error) {
    console.error('Error unsaving resource:', error);
    return NextResponse.json({ error: 'Failed to unsave resource' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const savedResources = await prisma.savedResource.findMany({
      where: { userId: session.user.id },
      include: {
        resource: {
          include: {
            user: {
              select: { 
                name: true,
                image: true 
              }
            }
          }
        }
      }
    });
    return NextResponse.json(savedResources);
  } catch (error) {
    console.error('Error fetching saved resources:', error);
    return NextResponse.json({ error: 'Failed to fetch saved resources' }, { status: 500 });
  }
}