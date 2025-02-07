import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    
    console.log('Searching for user with:', username);

    // First try exact match
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      },
      include: {
        resources: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // If no exact match found, try fuzzy match
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            {
              username: {
                contains: username,
                mode: 'insensitive'
              }
            },
            {
              email: {
                equals: username,
                mode: 'insensitive'
              }
            }
          ]
        },
        include: {
          resources: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }

    console.log('Found user:', user?.username);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
