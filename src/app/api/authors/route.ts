import { prisma } from "@/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const authors = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        reputation: true,
        followerIds: true,
        followingIds: true,
        _count: {
          select: {
            blogs: true
          }
        }
      },
      orderBy: {
        blogs: { _count: 'desc' }
      },
      take: 5
    });

    // Log the raw data with specific focus on followerIds
    console.log('Raw DB data:', authors.map(a => ({
      name: a.name,
      followerIds: a.followerIds,
      isArray: Array.isArray(a.followerIds),
      type: typeof a.followerIds
    })));

    const formattedAuthors = authors.map(author => {
      // Add detailed logging for follower counting
      const followerCount = Array.isArray(author.followerIds) ? author.followerIds.length : 0;
      const followingCount = Array.isArray(author.followingIds) ? author.followingIds.length : 0;

      console.log(`Processing ${author.name}:`, {
        followerIds: author.followerIds,
        isArray: Array.isArray(author.followerIds),
        followerCount,
        followingCount
      });

      return {
        id: author.id,
        name: author.name,
        username: author.username,
        image: author.image,
        reputation: author.reputation,
        _count: {
          posts: author._count.blogs,
          followers: followerCount,
          following: followingCount
        }
      };
    });

    // Log final output
    console.log('Final formatted data:', formattedAuthors.map(a => ({
      name: a.name,
      counts: a._count
    })));

    return NextResponse.json(formattedAuthors);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error details:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
} 