/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from "next/navigation"
import { prisma } from "@/prisma"
import { formatDistanceToNow, format, formatDistanceToNowStrict } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  BookmarkIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MessageSquareIcon,
  ClockIcon,
  EyeIcon,
  HashIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
  LinkIcon,
  MoreHorizontalIcon,
  ListOrderedIcon,
  ZoomInIcon,
  X,
  Share2Icon
} from "lucide-react"
import hljs from "highlight.js/lib/core"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import css from "highlight.js/lib/languages/css"
import python from "highlight.js/lib/languages/python"
import java from "highlight.js/lib/languages/java"
import rust from "highlight.js/lib/languages/rust"
import go from "highlight.js/lib/languages/go"
import ruby from "highlight.js/lib/languages/ruby"
import php from "highlight.js/lib/languages/php"
import sql from "highlight.js/lib/languages/sql"
import shell from "highlight.js/lib/languages/shell"
import yaml from "highlight.js/lib/languages/yaml"
import { JSDOM } from "jsdom"
import 'highlight.js/styles/github-dark.css'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Metadata } from 'next'
import { cn } from "@/lib/utils"
import { TableOfContents } from "@/components/blog/TableOfContents"
import { headers } from 'next/headers'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ImageZoom } from "@/components/blog/ImageZoom"
import { ContentImageZoom } from "@/components/blog/ContentImageZoom"
import { auth } from "@/auth"
import { recordView, toggleSave, vote } from "@/app/(blog)/blog/actions"
import { motion, AnimatePresence } from "framer-motion"
import { StickyHeaderClient } from "@/components/blog/StickyHeaderClient"

// Register languages
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("html", xml)
hljs.registerLanguage("css", css)
hljs.registerLanguage("python", python)
hljs.registerLanguage("java", java)
hljs.registerLanguage("rust", rust)
hljs.registerLanguage("go", go)
hljs.registerLanguage("ruby", ruby)
hljs.registerLanguage("php", php)
hljs.registerLanguage("sql", sql)
hljs.registerLanguage("shell", shell)
hljs.registerLanguage("yaml", yaml)
hljs.registerLanguage("js", javascript)
hljs.registerLanguage("ts", typescript)

// Helper function to process code blocks with syntax highlighting
const processCodeBlocks = (content: string) => {
  const dom = new JSDOM(content)
  const doc = dom.window.document
  
  // Process blockquotes
  doc.querySelectorAll("blockquote").forEach((blockquote) => {
    blockquote.innerHTML = blockquote.innerHTML.replace(/[""]/g, '')
  })

  // Process code blocks
  doc.querySelectorAll("pre code").forEach((codeElement) => {
    let code = codeElement.textContent || ""
    // Remove backticks and trim whitespace
    code = code.replace(/^```|```$/g, "").trim()
    code = code.replace(/^"|"$/g, "").trim() // Also remove any quotes

    const languageMatch = codeElement.className.match(/language-(\w+)/)
    const language = languageMatch ? languageMatch[1] : ''

    try {
      if (language && hljs.getLanguage(language)) {
        const result = hljs.highlight(code, { language })
        codeElement.innerHTML = result.value
        codeElement.classList.add("hljs")
      } else {
        const result = hljs.highlightAuto(code)
        codeElement.innerHTML = result.value
        codeElement.classList.add("hljs")
      }
    } catch (error) {
      console.error('Error highlighting code:', error)
      codeElement.textContent = code
    }
    
    const preElement = codeElement.parentElement
    if (preElement) {
      preElement.classList.add("highlight-pre")
    }
  })

  // Process images with zoom functionality
  doc.querySelectorAll("img").forEach((img) => {
    const figure = doc.createElement("figure")
    const wrapper = doc.createElement("div")
    wrapper.className = "my-6"
    
    // Create a div that will be hydrated as ImageZoom
    const zoomWrapper = doc.createElement("div")
    zoomWrapper.setAttribute('data-image-zoom', '')
    zoomWrapper.setAttribute('data-image-src', img.src)
    zoomWrapper.setAttribute('data-image-alt', img.alt || '')
    
    // Create the actual image element that will be shown before hydration
    const imgElement = doc.createElement("img")
    imgElement.src = img.src
    imgElement.alt = img.alt || ""
    imgElement.className = "w-full h-auto rounded-lg cursor-zoom-in transition-all hover:opacity-90"
    zoomWrapper.appendChild(imgElement)
    
    // Add caption if alt text exists
    if (img.alt) {
      const figcaption = doc.createElement("figcaption")
      figcaption.className = "text-sm text-muted-foreground text-center mt-2"
      figcaption.textContent = img.alt
      figure.appendChild(figcaption)
    }
    
    wrapper.appendChild(zoomWrapper)
    figure.appendChild(wrapper)
    img.parentNode?.replaceChild(figure, img)
  })

  return doc.body.innerHTML
}

// Update the interface to reflect Promise type
interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string) {
  const session = await auth()
  
  const post = await prisma.blog.findUnique({
    where: {
      slug,
    },
    include: {
      user: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          saves: true,
          votes: true,
        }
      },
      likes: session?.user?.id ? {
        where: { userId: session.user.id },
        take: 1,
      } : false,
      saves: session?.user?.id ? {
        where: { userId: session.user.id },
        take: 1,
      } : false,
      votes: true,
    },
  })

  if (!post) {
    return null
  }

  // Get unique view count
  const views = await prisma.blogView.groupBy({
    by: ['userId'],
    where: {
      blogId: post.id,
      userId: { not: null }, // Only count logged-in users
    },
  })

  const uniqueViews = views.length

  await recordView(post.id)

  return {
    ...post,
    uniqueViews
  }
}

const calculateReadingTime = (content: string): number => {
  if (!content) return 1
  
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length
  return Math.max(Math.ceil(wordCount / 200), 1)
}

// Add this helper function to create URL-friendly slugs
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
}

// Update the generateTableOfContents function
const generateTableOfContents = (content: string) => {
  const dom = new JSDOM(content)
  const doc = dom.window.document
  
  // First ensure all headings have proper IDs based on their text
  doc.querySelectorAll('h2, h3').forEach((heading) => {
    const text = heading.textContent?.trim() || ''
    heading.id = slugify(text) // Set ID as slugified text
  })

  const toc = Array.from(doc.querySelectorAll('h2, h3')).map(heading => ({
    id: heading.id,
    text: heading.textContent?.trim() || '',
    level: heading.tagName.toLowerCase()
  }))

  // Return both TOC data and the modified content
  return {
    toc,
    content: doc.body.innerHTML // This will include the updated IDs
  }
}

// 2. Progress Bar (already implemented in your code, but could be enhanced)
// 3. Share Buttons Component
const ShareButtons = ({ post }: { post: BlogPost }) => {
  const shareUrl = `https://yoursite.com/blog/${post.slug}`
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigator.clipboard.writeText(shareUrl)}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        asChild
      >
        <a 
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <TwitterIcon className="h-4 w-4" />
        </a>
      </Button>
    </div>
  )
}

// 4. Estimated Reading Progress
const ReadingProgress = ({ readingProgress }: { readingProgress: number }) => (
  <div className="fixed top-0 left-0 w-full h-1 bg-muted">
    <div 
      className="h-full bg-primary transition-all duration-300"
      style={{ width: `${readingProgress}%` }}
    />
  </div>
)

// Add proper type for the blog post
interface BlogPost {
  id: string
  title: string
  content: string
  slug: string
  summary: string | null
  coverImage: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  _count: {
    likes: number
    comments: number
    saves: number
    votes: number
  }
  likes: Array<{ id: string }>
  saves: Array<{ id: string }>
  votes: Array<{ type: 'UP' | 'DOWN' }>
  uniqueViews: number
  tags: string[]
}

// Add more structured data types
function generateStructuredData(post: BlogPost) {
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.createdAt.toISOString(), // Convert to ISO string
    dateModified: post.updatedAt.toISOString(),  // Convert to ISO string
    author: {
      '@type': 'Person',
      name: post.user.name,
      url: `https://yoursite.com/u/${post.user.username}`,
      // Add more author details
      image: post.user.image || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Site Name',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yoursite.com/logo.png',
        width: '190',
        height: '60'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://yoursite.com/blog/${post.slug}`
    },
    keywords: post.tags.join(', '),
    articleBody: post.content.replace(/<[^>]*>/g, ''),
    wordCount: post.content.split(/\s+/).length,
    articleSection: post.tags[0] || 'Blog',
    // Add more SEO-friendly fields
    inLanguage: 'en',
    timeRequired: `PT${calculateReadingTime(post.content)}M`,
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/'
  }

  // Add BreadcrumbList schema
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Blog',
        item: 'https://yoursite.com/blog'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: `https://yoursite.com/blog/${post.slug}`
      }
    ]
  }

  return [articleData, breadcrumbData]
}

// Update generateMetadata function
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) return { title: 'Post Not Found' }

  const headersList = await headers()
  const host = headersList.get('host')
  const baseUrl = `https://${host}`
  const readingTime = calculateReadingTime(post.content)

  return {
    title: `${post.title} | Your Blog Name`,
    description: post.summary || undefined,
    keywords: post.tags,
    authors: [{ name: post.user.name || undefined, url: `${baseUrl}/u/${post.user.username}` }],
    creator: post.user.name || undefined,
    publisher: 'Your Site Name',
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      }
    },
    openGraph: {
      title: post.title,
      description: post.summary || undefined,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [`${baseUrl}/u/${post.user.username}`],
      tags: post.tags,
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        }
      ] : [],
      siteName: 'Your Site Name',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || undefined,
      images: post.coverImage ? [post.coverImage] : [],
      creator: '@yourtwitterhandle',
      site: '@yoursitehandle',
      creatorId: '1234567890',
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
      languages: {
        'en-US': `${baseUrl}/blog/${post.slug}`,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
    other: {
      'article:published_time': post.createdAt.toISOString(),
      'article:modified_time': post.updatedAt.toISOString(),
      'article:author': post.user.name || '',
      'article:section': post.tags[0] || 'Blog',
      'article:tag': post.tags.join(','),
      'reading-time': `${readingTime} minutes`,
    },
  }
}

// Add static generation for core pages
export async function generateStaticParams() {
  const posts = await prisma.blog.findMany({
    where: { published: true },
    select: { slug: true },
    take: 100 // Adjust based on your needs
  })
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Add revalidation
export const revalidate = 3600 // Revalidate every hour

// Add this function to fetch related posts
async function getRelatedPosts(currentPost: any) {
  const relatedPosts = await prisma.blog.findMany({
    where: {
      AND: [
        { published: true },
        { id: { not: currentPost.id } },
        { userId: currentPost.userId },
      ],
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          username: true,
        }
      },
    },
    take: 2,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return relatedPosts
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) notFound()
  
  // Fetch related posts
  const relatedPosts = await getRelatedPosts(post)
  
  const { toc, content } = generateTableOfContents(post.content)
  const processedContent = processCodeBlocks(content)
  const readingTime = calculateReadingTime(post.content)
  const publishedDate = new Date(post.createdAt)
  
  // Generate structured data
  const structuredData = generateStructuredData(post)

  return (
    <>
      <StickyHeaderClient post={post} />
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="w-full min-h-screen bg-background" itemScope itemType="https://schema.org/BlogPosting">
        {/* Add semantic HTML and microdata */}
        <meta itemProp="headline" content={post.title} />
        <meta itemProp="description" content={post.summary || ''} />
        <meta itemProp="author" content={post.user.name || ''} />
        <meta itemProp="datePublished" content={post.createdAt.toISOString()} />
        <meta itemProp="dateModified" content={post.updatedAt.toISOString()} />
        {post.coverImage && <meta itemProp="image" content={post.coverImage} />}
        
        {/* Rest of your existing JSX with added semantic markup */}
        <header className="relative mb-8 px-4 pt-6">
          <div className="max-w-[900px] mx-auto">
            <div itemProp="author" itemScope itemType="https://schema.org/Person">
              {/* Author and Metadata */}
              <div className="flex items-center justify-between mb-4">
                <Link 
                  href={`/u/${post.user.username}`}
                  className="group flex items-center gap-2 hover:text-foreground"
                >
                  <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                    <AvatarImage src={post.user.image || ""} alt={post.user.name || ""} />
                    <AvatarFallback>{post.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {post.user.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span className="text-xs">{readingTime} min read</span>
                      </div>
                      <span>·</span>
                      <time 
                        dateTime={publishedDate.toISOString()}
                        itemProp="datePublished"
                        className="text-xs"
                      >
                        {formatDistanceToNowStrict(publishedDate)} ago
                      </time>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-xs">
                        <EyeIcon className="h-3 w-3" />
                        {post.uniqueViews} views
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Title and Summary */}
            <div className="space-y-3 mb-4">
              <h1 itemProp="headline" className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {post.title}
              </h1>
              {post.summary && (
                <p itemProp="description" className="text-base text-muted-foreground leading-relaxed">
                  {post.summary}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {post.tags.map((tag: string) => (
                <Link 
                  key={tag} 
                  href={`/blog/tags/${tag}`}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full 
                    bg-secondary/40 hover:bg-secondary/60 transition-colors"
                >
                  <HashIcon className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
            </div>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="mt-6 relative w-full">
                <div className="aspect-[2/1] w-full rounded-lg border border-border/50 overflow-hidden">
                  <ImageZoom 
                    src={post.coverImage} 
                    alt={post.title}
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Table of Contents - Full width with background */}
        {toc.length > 0 && <TableOfContents toc={toc} />}

        {/* Main content section */}
        <div itemProp="articleBody" className="px-4 py-6">
          <div className="max-w-[900px] mx-auto">
            {/* This component handles the image zoom functionality */}
            <ContentImageZoom />
            
            <div 
              className="prose prose-neutral dark:prose-invert max-w-none
                prose-headings:font-semibold
                prose-h1:text-xl
                prose-h2:text-lg
                prose-h3:text-base
                prose-p:text-sm prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                [&_.highlight-pre]:bg-zinc-950 
                [&_.highlight-pre]:dark:bg-zinc-900 
                [&_.highlight-pre]:p-3
                [&_.highlight-pre]:rounded-xl
                [&_.highlight-pre]:my-3
                [&_.highlight-pre]:overflow-x-auto
                [&_.highlight-pre]:max-w-full
                [&_.highlight-pre]:break-words
                [&_.highlight-pre_code]:!bg-transparent 
                [&_.highlight-pre_code]:text-zinc-50 
                [&_.highlight-pre_code]:whitespace-pre-wrap
                [&_.highlight-pre_code]:word-break-all
                [&_pre]:max-w-full
                [&_pre]:overflow-x-auto
                [&_code]:break-all
                [&_:not(pre)>code]:bg-secondary/30
                [&_:not(pre)>code]:text-foreground
                [&_:not(pre)>code]:px-1.5 
                [&_:not(pre)>code]:py-0.5 
                [&_:not(pre)>code]:rounded-md
                [&_:not(pre)>code]:text-xs"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Author Bio */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.user.image || ""} alt={post.user.name || ""} />
                  <AvatarFallback>{post.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/u/${post.user.username}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {post.user.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {post.user.bio || "No bio available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            <div className="mt-6 pt-4 border-t">
              <h2 className="text-sm font-medium mb-3">More from {post.user.name}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`} 
                    className="group block space-y-1.5 rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <h3 className="line-clamp-2 text-sm font-medium group-hover:underline">
                      {relatedPost.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {relatedPost.summary || relatedPost.content.slice(0, 100)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <time dateTime={relatedPost.createdAt.toISOString()}>
                        {formatDistanceToNowStrict(new Date(relatedPost.createdAt))} ago
                      </time>
                      <span>·</span>
                      <span>{calculateReadingTime(relatedPost.content)} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  )
} 