import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET() {
  console.log('Tags API endpoint called');
  try {
    // Get all resources
    const resources = await prisma.resource.findMany({
      select: {
        tags: true,
      },
    });

    console.log('Resources found for tags:', resources.length);

    // Count occurrences of each tag
    const tagCounts: Record<string, number> = {};
    resources.forEach(resource => {
      resource.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 20); // Get top 20 tags

    console.log('Popular tags found:', sortedTags.length);

    return NextResponse.json({ tags: sortedTags });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular tags' },
      { status: 500 }
    );
  }
} 