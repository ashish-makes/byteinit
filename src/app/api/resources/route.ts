/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/resources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { ResourceCategory, ResourceType } from '@prisma/client';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  try {
    const resource = await prisma.resource.create({
      data: {
        ...body,
        userId: session.user.id
      }
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as ResourceCategory | null;
  const type = searchParams.get('type') as ResourceType | null;
  
  try {
    const resources = await prisma.resource.findMany({
      where: {
        ...(category && { category }),
        ...(type && { type })
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}