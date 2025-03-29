import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type } = await req.json();

    // Get the resource to check ownership
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Create or update interaction
    const interaction = await prisma.resourceInteraction.upsert({
      where: {
        resourceId_userId_type: {
          resourceId: params.id,
          userId: session.user.id,
          type,
        },
      },
      update: {},
      create: {
        resourceId: params.id,
        userId: session.user.id,
        type,
      },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error handling resource interaction:', error);
    return NextResponse.json(
      { error: 'Failed to handle resource interaction' },
      { status: 500 }
    );
  }
} 