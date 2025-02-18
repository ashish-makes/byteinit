import { MetadataRoute } from 'next'
import { prisma } from "../prisma"

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
      url: 'https://yoursite.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `https://yoursite.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
} 