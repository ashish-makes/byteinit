/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/manage-resources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

// Validation schema for resource creation/update
const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum([
    "LIBRARY", 
    "TOOL", 
    "FRAMEWORK", 
    "TUTORIAL", 
    "TEMPLATE", 
    "ICON_SET", 
    "ILLUSTRATION", 
    "COMPONENT_LIBRARY", 
    "CODE_SNIPPET", 
    "API", 
    "DOCUMENTATION", 
    "COURSE", 
    "OTHER"
  ]),
  category: z.enum([
    "FRONTEND", 
    "BACKEND", 
    "FULLSTACK", 
    "DEVOPS", 
    "MOBILE", 
    "AI_ML", 
    "DATABASE", 
    "SECURITY", 
    "UI_UX", 
    "DESIGN", 
    "MACHINE_LEARNING", 
    "CLOUD", 
    "OTHER"
  ]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.array(z.string()).optional()
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const type = searchParams.get('type') || undefined;
  
  try {
    const resources = await prisma.resource.findMany({
      where: {
        userId: session.user.id,
        ...(category && { category: category as any }),
        ...(type && { type: type as any })
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });

    // Map the results to exclude the full user object if needed
    const formattedResources = resources.map(resource => ({
      ...resource,
      user: {
        name: resource.user.name,
        image: resource.user.image
      }
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error('Error fetching user resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Validate the request body
    const validatedData = resourceSchema.parse(body);

    const resource = await prisma.resource.create({
      data: {
        ...validatedData,
        userId: session.user.id
      }
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}