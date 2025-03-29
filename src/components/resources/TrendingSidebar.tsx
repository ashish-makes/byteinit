import React from 'react'
import { prisma } from "@/prisma"
import RightSidebar from "./RightSidebar"

export async function TrendingSidebar() {
  console.log('TrendingSidebar component rendering...')
  try {
    const trendingResources = await prisma.resource.findMany({
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
          uniqueViews: 'desc'
        },
        {
          interactions: {
            _count: 'desc'
          }
        },
        {
          savedResources: {
            _count: 'desc'
          }
        }
      ],
      take: 5
    })

    console.log('Fetched trending resources:', trendingResources)

    if (!trendingResources.length) {
      console.log('No trending resources found')
      return <RightSidebar trendingResources={[]} />
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

    console.log('Transformed resources:', resources)
    
    return <RightSidebar trendingResources={resources} />
  } catch (error) {
    console.error('Error fetching trending resources:', error)
    return <RightSidebar trendingResources={[]} />
  }
} 