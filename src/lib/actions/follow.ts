"use server"

import { prisma } from "@/prisma"
import { auth } from "@/auth"

export async function toggleFollow(username: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    const currentUserId = session.user.id
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (!targetUser) {
      throw new Error("User not found")
    }

    if (currentUserId === targetUser.id) {
      throw new Error("Cannot follow yourself")
    }

    const existingFollow = await prisma.user.findFirst({
      where: {
        id: currentUserId,
        following: {
          some: { id: targetUser.id }
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await prisma.user.update({
        where: { id: currentUserId },
        data: {
          following: {
            disconnect: { id: targetUser.id }
          }
        }
      })
      return { following: false }
    } else {
      // Follow
      await prisma.user.update({
        where: { id: currentUserId },
        data: {
          following: {
            connect: { id: targetUser.id }
          }
        }
      })
      return { following: true }
    }
  } catch (error) {
    console.error('Follow error:', error)
    throw error
  }
}

export async function getFollowStats(userId: string) {
  const session = await auth()
  const currentUserId = session?.user?.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      followers: true,
      following: true,
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
  })

  if (!user) {
    return {
      followers: 0,
      following: 0,
      isFollowing: false
    }
  }

  return {
    followers: user._count.followers,
    following: user._count.following,
    isFollowing: currentUserId ? user.followers.some(f => f.id === currentUserId) : false
  }
} 