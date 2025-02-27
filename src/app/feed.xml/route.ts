import { prisma } from "../../prisma"
import RSS from 'rss'
import { siteConfig } from '@/config/site'

export async function GET() {
  const feed = new RSS({
    title: siteConfig.name,
    description: siteConfig.description,
    feed_url: `${siteConfig.domain}/feed.xml`,
    site_url: siteConfig.domain,
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
      url: `${siteConfig.domain}/blog/${post.slug}`,
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