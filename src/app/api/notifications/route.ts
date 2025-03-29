import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch real notifications from the database
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        actionUser: {
          select: {
            name: true,
            image: true
          }
        },
        resource: {
          select: {
            id: true,
            title: true
          }
        },
        blog: {
          select: {
            id: true,
            title: true
          }
        },
        comment: {
          select: {
            id: true,
            content: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      notifications: notifications 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    // If there's an error fetching from the database, return an empty array
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { notificationIds } = await req.json();
    
    // Update real notifications in the database
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({ 
      message: 'Notifications marked as read',
      updatedIds: notificationIds
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { notificationIds } = await req.json();
    
    // Delete real notifications from the database
    await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      }
    });

    return NextResponse.json({ 
      message: 'Notifications deleted',
      deletedIds: notificationIds
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
} 