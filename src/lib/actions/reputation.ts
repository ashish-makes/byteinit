import { prisma } from "@/prisma"

export async function updateUserReputation(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      blogs: {
        where: { published: true },
        select: {
          _count: {
            select: {
              views: true,
              likes: true,
              comments: true,
              votes: {
                where: { type: 'UP' }
              }
            }
          }
        }
      }
    }
  });

  if (!user) return;

  // Calculate reputation based on engagement
  const reputation = user.blogs.reduce((total, blog) => {
    return total + (
      blog._count.views * 1 +      // 1 point per view
      blog._count.likes * 5 +      // 5 points per like
      blog._count.comments * 3 +   // 3 points per comment
      blog._count.votes * 10       // 10 points per upvote
    )
  }, 0);

  await prisma.user.update({
    where: { id: userId },
    data: { reputation }
  });

  return reputation;
} 