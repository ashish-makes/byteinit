import { prisma } from "../../prisma"
import RSS from 'rss'

export async function GET() {
  const feed = new RSS({
    title: 'Your Blog Name',
    description: 'Your blog description',
    feed_url: 'https://yoursite.com/feed.xml',
    site_url: 'https://yoursite.com',
    language: 'en',
  })

  const posts = await prisma.blog.findMany({
    where: { published: true },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.summary || '',
      url: `https://yoursite.com/blog/${post.slug}`,
      author: post.user?.name || 'Anonymous',
      date: post.createdAt,
    })
  })

  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
} 