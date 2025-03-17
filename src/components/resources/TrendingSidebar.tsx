import React from 'react'
import { prisma } from "@/prisma"
import RightSidebar from "./RightSidebar"

export async function TrendingSidebar() {
  try {
    // Get resources from the last 7 days
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const trendingResources = await prisma.resource.findMany({
      where: {
        createdAt: {
          gte: lastWeek
        }
      },
      select: {
        id: true,
        title: true,
        url: true,
        uniqueViews: true,
        _count: {
          select: {
            interactions: {
              where: {
                type: 'LIKE'
              }
            },
            savedResources: true,
          }
        }
      },
      orderBy: [
        {
          interactions: {
            _count: 'desc'
          }
        },
        {
          savedResources: {
            _count: 'desc'
          }
        },
        {
          uniqueViews: 'desc'
        }
      ],
      take: 10
    })

    if (!trendingResources.length) {
      console.log('No trending resources found')
      return null
    }

    // Transform the data to match the expected format
    const resources = trendingResources.map(resource => ({
      id: resource.id,
      title: resource.title,
      url: resource.url,
      likes: resource._count.interactions,
      saves: resource._count.savedResources,
      views: resource.uniqueViews
    }))

    console.log(`Found ${resources.length} trending resources`)
    
    return <RightSidebar trendingResources={resources} />
  } catch (error) {
    console.error('Error fetching trending resources:', error)
    return null
  }
} 