import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET() {
  console.log('All resources API endpoint called');
  try {
    // Get all resources without any filtering
    const allResources = await prisma.resource.findMany({
      include: {
        _count: {
          select: {
            interactions: true,
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
      take: 100 // Limit to 100 resources
    });

    console.log(`Found ${allResources.length} resources in the database`);
    
    if (allResources.length === 0) {
      // If no resources found, return mock data
      console.log('No resources found, returning mock data');
      
      const mockResources = [
        {
          id: 'mock-1',
          title: 'Mock Resource 1',
          description: 'This is a mock resource',
          url: 'https://example.com/1',
          type: 'LIBRARY',
          category: 'FRONTEND',
          tags: ['react', 'nextjs'],
          likes: 120,
          saves: 45,
          views: 1200,
          createdAt: new Date().toISOString(),
          user: {
            name: 'Mock User',
            image: 'https://github.com/shadcn.png'
          }
        },
        {
          id: 'mock-2',
          title: 'Mock Resource 2',
          description: 'This is another mock resource',
          url: 'https://example.com/2',
          type: 'TOOL',
          category: 'BACKEND',
          tags: ['nodejs', 'express'],
          likes: 80,
          saves: 30,
          views: 800,
          createdAt: new Date().toISOString(),
          user: {
            name: 'Mock User',
            image: 'https://github.com/shadcn.png'
          }
        }
      ];
      
      return NextResponse.json({ 
        resources: mockResources,
        isMock: true
      });
    }

    // Transform the data to match the expected format
    const resources = allResources.map(resource => ({
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
    console.error('Error fetching all resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
} 