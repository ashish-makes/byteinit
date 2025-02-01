/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/resources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { ResourceCategory, ResourceType } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure the request body is valid
    const body = await req.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    const { title, description, url, type, category, tags } = body;

    // Validate required fields from schema
    if (!title || !description || !url || !type || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create resource with validated data
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        url,
        type: type as ResourceType,
        category: category as ResourceCategory,
        tags: Array.isArray(tags) ? tags : [],
        userId: session.user.id,
        // Initialize counters
        uniqueViews: 0,
        totalViews: 0,
        likes: 0,
        saves: 0
      }
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Resource creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as ResourceCategory | null;
  const type = searchParams.get('type') as ResourceType | null;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  try {
    const resources = await prisma.resource.findMany({
      where: {
        ...(category && { category }),
        ...(type && { type })
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        reactions: {
          select: {
            emoji: true,
            userId: true,
          }
        },
        _count: {
          select: {
            interactions: {
              where: {
                type: 'LIKE'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Group reactions by emoji for each resource
    const resourcesWithFormattedReactions = resources.map(resource => {
      const reactionCounts = resource.reactions.reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const formattedReactions = Object.entries(reactionCounts).map(([emoji, count]) => ({
        emoji,
        _count: count
      }));

      return {
        ...resource,
        reactions: formattedReactions,
        userReactions: resource.reactions
      };
    });

    return NextResponse.json(resourcesWithFormattedReactions);
  } catch (error) {
    console.error('Resources fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}
