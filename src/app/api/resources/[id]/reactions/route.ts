/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server"
import { prisma } from "@/prisma"
import { auth } from "@/auth"

// Update the type so that params is a Promise
type ContextWithParams = { params: Promise<{ id: string }> }

export async function GET(
  req: Request,
  context: ContextWithParams
) {
  try {
    // Await the params promise
    const { id: resourceId } = await context.params;

    const [reactions, userReactions] = await Promise.all([
      prisma.resourceReaction.groupBy({
        by: ['emoji'],
        where: { resourceId },
        _count: true
      }),
      prisma.resourceReaction.findMany({
        where: { resourceId },
        select: {
          emoji: true,
          userId: true
        }
      })
    ]);

    return NextResponse.json({ reactions, userReactions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: ContextWithParams
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Await the params promise here too
    const { id: resourceId } = await context.params;
    const { emoji } = await req.json();

    const existingReaction = await prisma.resourceReaction.findFirst({
      where: {
        resourceId,
        userId: session.user.id,
        emoji
      }
    });

    let result;
    if (existingReaction) {
      await prisma.resourceReaction.delete({
        where: { id: existingReaction.id }
      });
      result = { removed: true };
    } else {
      await prisma.resourceReaction.create({
        data: {
          emoji,
          userId: session.user.id,
          resourceId
        }
      });
      result = { added: true };
    }

    // Fetch updated reactions
    const [reactions, userReactions] = await Promise.all([
      prisma.resourceReaction.groupBy({
        by: ['emoji'],
        where: { resourceId },
        _count: true
      }),
      prisma.resourceReaction.findMany({
        where: { resourceId },
        select: {
          emoji: true,
          userId: true
        }
      })
    ]);

    return NextResponse.json({
      ...result,
      reactions: reactions.map(r => ({ emoji: r.emoji, _count: r._count })),
      userReactions
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
  }
}
