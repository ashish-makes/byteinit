import React from 'react'
import { prisma } from "../../prisma"
import RightSidebar from "./RightSidebar"

export async function TrendingSidebar() {
  try {
    // Get posts from the last 7 days
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const [trendingPosts, topAuthors] = await Promise.all([
      prisma.blog.findMany({
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
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: {
          reputation: 'desc'
        },
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
          reputation: true,
          _count: {
            select: {
              followers: true,
              blogs: true,
              following: true
            }
          }
        }
      })
    ])

    if (!trendingPosts.length) {
      return null
    }

    return <RightSidebar 
      trendingPosts={trendingPosts} 
      topAuthors={topAuthors.map(author => ({
        ...author,
        _count: {
          ...author._count,
          posts: author._count.blogs
        }
      }))}
    />
  } catch (error) {
    console.error('Error fetching trending posts:', error)
    return null
  }
} 