import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { formatDistance } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      include: {
        actionUser: {
          select: { name: true, image: true },
        },
        resource: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Modify this section to return a 200 status with an empty array instead of 404
    const formattedNotifications = notifications
      .filter(notification => notification.actionUser !== null)
      .map((notification) => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        timeAgo: formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true }),
        actionUser: {
          name: notification.actionUser?.name || null,
          image: notification.actionUser?.image || null,
        },
        resource: {
          title: notification.resource?.title || '',
        },
      }));

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
      empty: formattedNotifications.length === 0 // Add this flag
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error details:', error.stack);
      return NextResponse.json(
        {
          error: 'Failed to fetch notifications',
          details: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error('Unknown error occurred:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch notifications',
          details: 'An unknown error occurred',
        },
        { status: 500 }
      );
    }
  }
}

export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const { notificationIds } = await request.json();
  
      // Delete current selected notifications
      await prisma.$transaction([
        // Delete selected notifications
        prisma.notification.deleteMany({
          where: {
            id: { in: notificationIds },
            userId: session.user.id,
          },
        }),
        // Delete older notifications (e.g., more than 30 days old)
        prisma.notification.deleteMany({
          where: {
            userId: session.user.id,
            createdAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
            }
          }
        })
      ]);
  
      return NextResponse.json({ message: 'Notifications cleared' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return NextResponse.json(
        {
          error: 'Failed to clear notifications',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }