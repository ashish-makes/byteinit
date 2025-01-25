/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/saved-resources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { resourceId } = await req.json();
  
  try {
    const savedResource = await prisma.savedResource.create({
      data: {
        userId: session.user.id,
        resourceId
      }
    });
    return NextResponse.json(savedResource, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save resource' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get('resourceId');
  
  try {
    await prisma.savedResource.deleteMany({
      where: {
        userId: session.user.id,
        resourceId: resourceId || undefined
      }
    });
    return NextResponse.json({ message: 'Resource unsaved' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsave resource' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const savedResources = await prisma.savedResource.findMany({
      where: { userId: session.user.id },
      include: {
        resource: {
          include: {
            user: {
              select: { 
                name: true,
                image: true 
              }
            }
          }
        }
      }
    });
    return NextResponse.json(savedResources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch saved resources' }, { status: 500 });
  }
}