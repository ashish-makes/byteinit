import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify the API key for security
  const { headers } = request
  const apiKey = headers.get('x-api-key')
  
  if (apiKey !== process.env.UPDATE_FEATURED_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const prisma = new PrismaClient()
    
    console.log('Starting featured posts update...')
    
    // First, reset all featured flags to false
    await prisma.blog.updateMany({
      where: { featured: true },
      data: { featured: false }
    })
    
    // Get the most engaging posts (based on votes, comments, views)
    const topPosts = await prisma.blog.findMany({
      where: {
        published: true,
      },
      orderBy: [
        { votes: { _count: 'desc' }},
        { comments: { _count: 'desc' }},
        { views: { _count: 'desc' }}
      ],
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            votes: true,
            comments: true,
            views: true,
          }
        }
      },
      take: 3, // Get top 3 posts
    })
    
    if (topPosts.length === 0) {
      console.log('No published posts found to set as featured')
      return NextResponse.json({ success: true, message: 'No posts to feature' })
    }
    
    // Update these posts to be featured
    await prisma.blog.updateMany({
      where: {
        id: {
          in: topPosts.map(post => post.id)
        }
      },
      data: {
        featured: true
      }
    })
    
    console.log(`Successfully set ${topPosts.length} posts as featured`)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${topPosts.length} featured posts`,
      posts: topPosts.map(post => ({
        title: post.title,
        votes: post._count.votes,
        comments: post._count.comments,
        views: post._count.views
      }))
    })
  } catch (error) {
    console.error('Error updating featured posts:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update featured posts' 
    }, { status: 500 })
  }
} 