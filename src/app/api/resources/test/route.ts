import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Test API endpoint called');
  
  // Mock trending resources
  const mockResources = [
    {
      id: 'test-1',
      title: 'Test Resource 1',
      url: 'https://example.com/1',
      likes: 120,
      saves: 45,
      views: 1200,
      createdAt: new Date().toISOString(),
      user: {
        name: 'Test User',
        image: 'https://github.com/shadcn.png'
      }
    },
    {
      id: 'test-2',
      title: 'Test Resource 2',
      url: 'https://example.com/2',
      likes: 80,
      saves: 30,
      views: 800,
      createdAt: new Date().toISOString(),
      user: {
        name: 'Test User',
        image: 'https://github.com/shadcn.png'
      }
    },
    {
      id: 'test-3',
      title: 'Test Resource 3',
      url: 'https://example.com/3',
      likes: 50,
      saves: 20,
      views: 500,
      createdAt: new Date().toISOString(),
      user: {
        name: 'Test User',
        image: 'https://github.com/shadcn.png'
      }
    }
  ];

  // Mock popular tags
  const mockTags = [
    'react', 'nextjs', 'typescript', 'tailwind', 'prisma'
  ];

  return NextResponse.json({ 
    resources: mockResources,
    tags: mockTags
  });
} 