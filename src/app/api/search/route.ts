import { prisma } from "@/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ results: [] })
    }

    // Try to log the search query, but don't block if it fails
    try {
      await prisma.searchQuery.create({
        data: {
          query: query.toLowerCase().trim(),
        }
      });
    } catch (logError) {
      // Log the error but continue with the search
      console.warn('Failed to log search query:', logError);
    }

    const posts = await prisma.blog.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { hasEvery: [query] } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        tags: true,
        summary: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    return new NextResponse(
      JSON.stringify({ results: posts }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Search error:', error)
    return new NextResponse(
      JSON.stringify({ results: [], error: 'Failed to search posts' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 