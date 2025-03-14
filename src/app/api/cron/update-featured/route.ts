import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

// Vercel cron jobs can only run for 10 seconds in Hobby tier
// So we need to make this efficient
export async function GET() {
  // Verify that this is a cron job request
  const authHeader = headers().get('Authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
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

// Helper function to get headers
function headers() {
  return {
    get: (name: string) => {
      if (typeof process !== 'undefined') {
        return process.env.CRON_SECRET && name === 'Authorization'
          ? `Bearer ${process.env.CRON_SECRET}`
          : null
      }
      return null
    }
  }
} 