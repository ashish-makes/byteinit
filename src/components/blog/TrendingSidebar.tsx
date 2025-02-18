import React from 'react'
import { prisma } from "../../prisma"
import RightSidebar from "./RightSidebar"

export async function TrendingSidebar() {
  try {
    // Get posts from the last 7 days
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const trendingPosts = await prisma.blog.findMany({
      where: {
        published: true,
        createdAt: {
          gte: lastWeek
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            views: true,
          }
        }
      },
      orderBy: [
        {
          votes: {
            _count: 'desc'
          }
        },
        {
          comments: {
            _count: 'desc'
          }
        },
        {
          views: {
            _count: 'desc'
          }
        }
      ],
      take: 5
    })

    if (!trendingPosts.length) {
      return null
    }

    return <RightSidebar trendingPosts={trendingPosts} />
  } catch (error) {
    console.error('Error fetching trending posts:', error)
    return null
  }
} 