'use server'

import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleLike(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingLike = await prisma.blogLike.findUnique({
    where: {
      blogId_userId: {
        blogId,
        userId: session.user.id,
      },
    },
  })

  if (existingLike) {
    await prisma.blogLike.delete({
      where: { id: existingLike.id },
    })
  } else {
    await prisma.blogLike.create({
      data: {
        blogId,
        userId: session.user.id,
      },
    })
  }

  revalidatePath('/dashboard/blog')
}

export async function toggleSave(blogId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingSave = await prisma.blogSave.findUnique({
    where: {
      blogId_userId: {
        blogId,
        userId: session.user.id,
      },
    },
  })

  if (existingSave) {
    await prisma.blogSave.delete({
      where: { id: existingSave.id },
    })
  } else {
    await prisma.blogSave.create({
      data: {
        blogId,
        userId: session.user.id,
      },
    })
  }

  revalidatePath('/dashboard/blog')
}

export async function recordView(blogId: string) {
  const session = await auth()
  
  await prisma.blogView.create({
    data: {
      blogId,
      userId: session?.user?.id,
    },
  })
}

export async function vote(blogId: string, voteType: 'UP' | 'DOWN') {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const existingVote = await prisma.blogVote.findUnique({
    where: {
      blogId_userId: {
        blogId,
        userId: session.user.id,
      },
    },
  })

  if (existingVote) {
    if (existingVote.type === voteType) {
      // Remove vote if clicking same button
      await prisma.blogVote.delete({
        where: { id: existingVote.id },
      })
    } else {
      // Change vote type
      await prisma.blogVote.update({
        where: { id: existingVote.id },
        data: { type: voteType },
      })
    }
  } else {
    // Create new vote
    await prisma.blogVote.create({
      data: {
        blogId,
        userId: session.user.id,
        type: voteType,
      },
    })
  }

  revalidatePath('/dashboard/blog')
}

export async function deletePost(postId: string) {
  'use server'
  
  const response = await fetch(`/api/blog/${postId}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete post')
  }
  
  return response.json()
} 