import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { ResourceCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ resources: [] })
    }

    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
          {
            category: {
              in: Object.values(ResourceCategory).filter(cat => 
                cat.toLowerCase().includes(query.toLowerCase())
              )
            }
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            interactions: {
              where: {
                type: 'LIKE'
              }
            },
            savedResources: true,
          }
        },
        reactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit results
    })

    // Transform the data to match the ResourceCard component props
    const transformedResources = resources.map(resource => {
      // Group reactions by emoji and count them
      const reactionCounts: Record<string, number> = {};
      resource.reactions.forEach(reaction => {
        if (reaction.emoji) {
          reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
        }
      });

      // Convert to the format expected by ResourceCard
      const formattedReactions = Object.entries(reactionCounts).map(
        ([emoji, count]) => ({ emoji, _count: count })
      );

      return {
        ...resource,
        likes: resource._count.interactions,
        saves: resource._count.savedResources,
        reactions: formattedReactions,
      };
    });

    return NextResponse.json({ resources: transformedResources })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search resources' },
      { status: 500 }
    )
  }
} 