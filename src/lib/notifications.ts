import { prisma } from '@/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  actionUserId: string;
  type: NotificationType;
  resourceId?: string;
  blogId?: string;
  commentId?: string;
}

export async function createNotification({
  userId,
  actionUserId,
  type,
  resourceId,
  blogId,
  commentId,
}: CreateNotificationParams) {
  // Don't create notification if user is notifying themselves
  if (userId === actionUserId) return null;

  // Get the relevant data based on notification type
  let resource, blog, comment;
  if (resourceId) {
    resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { title: true },
    });
  }
  if (blogId) {
    blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { title: true },
    });
  }
  if (commentId) {
    comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { content: true },
    });
  }

  // Create the notification
  return prisma.notification.create({
    data: {
      userId,
      actionUserId,
      type,
      resourceId,
      blogId,
      commentId,
    },
    include: {
      actionUser: {
        select: {
          name: true,
          image: true,
        },
      },
      resource: {
        select: {
          title: true,
        },
      },
      blog: {
        select: {
          title: true,
        },
      },
      comment: {
        select: {
          content: true,
        },
      },
    },
  });
}

export function getNotificationMessage(notification: any) {
  const { type, actionUser, resource, blog, comment } = notification;
  const userName = actionUser.name || 'Someone';

  switch (type) {
    case 'RESOURCE_LIKE':
      return `${userName} liked your resource "${resource.title}"`;
    case 'RESOURCE_SAVE':
      return `${userName} saved your resource "${resource.title}"`;
    case 'BLOG_VOTE':
      return `${userName} voted on your post "${blog.title}"`;
    case 'BLOG_SAVE':
      return `${userName} saved your post "${blog.title}"`;
    case 'BLOG_COMMENT':
      return `${userName} commented on your post "${blog.title}"`;
    default:
      return 'New notification';
  }
} 