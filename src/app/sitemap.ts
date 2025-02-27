import { MetadataRoute } from 'next'
import { prisma } from "../prisma"
import { siteConfig } from '@/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.blog.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  return [
    {
      url: siteConfig.domain,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${siteConfig.domain}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
} 