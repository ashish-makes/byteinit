import { prisma } from "@/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get posts and their tags
    const posts = await prisma.blog.findMany({
      where: {
        published: true
      },
      select: {
        tags: true
      }
    });

    // Count tag occurrences
    const tagCounts = posts.reduce((acc, post) => {
      post.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort
    const popularTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json(popularTags);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json([]);
  }
} 