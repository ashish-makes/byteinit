import { PrismaClient } from '@prisma/client'

/**
 * This script automatically sets the top 3 posts with the best engagement as featured
 * and removes the featured flag from all other posts.
 */
async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Starting featured posts update...')
    
    // First, reset all featured flags to false
    await prisma.blog.updateMany({
      where: { featured: true },
      data: { featured: false }
    })
    
    console.log('Reset all featured flags')
    
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
      include: {
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
      return
    }
    
    // Update these posts to be featured
    const updatePromises = topPosts.map(post => 
      prisma.blog.update({
        where: { id: post.id },
        data: { featured: true }
      })
    )
    
    await Promise.all(updatePromises)
    
    console.log(`Successfully set ${updatePromises.length} posts as featured:`)
    topPosts.forEach(post => {
      console.log(`- ${post.title} (Votes: ${post._count.votes}, Comments: ${post._count.comments}, Views: ${post._count.views})`)
    })
  } catch (error) {
    console.error('Error updating featured posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  }) 