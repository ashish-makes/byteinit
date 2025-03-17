import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET() {
  console.log('Trending API endpoint called');
  try {
    // Get resources with the most interactions (likes) in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('Fetching trending resources since:', sevenDaysAgo);
    
    const trendingResources = await prisma.resource.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      include: {
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
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: [
        {
          interactions: {
            _count: 'desc'
          }
        },
        {
          savedResources: {
            _count: 'desc'
          }
        },
        {
          createdAt: 'desc'
        }
      ],
      take: 10
    });

    console.log('Trending resources found:', trendingResources.length);
    
    // Transform the data to match the expected format
    const resources = trendingResources.map(resource => ({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      likes: resource._count.interactions,
      saves: resource._count.savedResources,
      views: resource.uniqueViews,
      createdAt: resource.createdAt,
      user: resource.user
    }));

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching trending resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending resources' },
      { status: 500 }
    );
  }
} 