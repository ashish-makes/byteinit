import { prisma } from "@/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get trending searches from the last 7 days
    const trendingSearches = await prisma.searchQuery.groupBy({
      by: ['query'],
      _count: {
        query: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: 5
    });

    return NextResponse.json(
      trendingSearches.map(search => ({
        query: search.query,
        count: search._count.query
      }))
    );
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    return NextResponse.json([]);
  }
} 