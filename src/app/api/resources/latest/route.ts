import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET() {
  try {
    const latestResources = await prisma.resource.findMany({
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Transform the data to match the expected format
    const resources = latestResources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      url: resource.url,
      type: resource.type,
      category: resource.category,
      tags: resource.tags,
      likes: resource._count.interactions,
      saves: resource._count.savedResources,
      views: resource.uniqueViews,
      createdAt: resource.createdAt,
      user: resource.user
    }));

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching latest resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest resources' },
      { status: 500 }
    );
  }
} 