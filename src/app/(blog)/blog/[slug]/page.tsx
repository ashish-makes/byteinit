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
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ImageZoom } from "@/components/blog/ImageZoom"
import { ContentImageZoom } from "@/components/blog/ContentImageZoom"
import { auth } from "@/auth"
import { recordView, toggleSave, vote, addComment, deleteComment, editComment, toggleCommentReaction } from "@/app/(blog)/blog/actions"
import { motion, AnimatePresence } from "framer-motion"
import { StickyHeaderClient } from "@/components/blog/StickyHeaderClient"
import { FollowButton } from "@/components/FollowButton"
import { getFollowStats } from "@/lib/actions/follow"
import { CommentSection } from "@/components/blog/CommentSection"
import React from "react"
import { BlogStats } from "@/components/blog/BlogStats"

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

// Add this helper type for recursive includes
type CommentInclude = {
  user: true;
  parent: true;
  replies: {
    include: CommentInclude;
  };
};

// Helper function to create recursive include object
function createCommentInclude(depth: number = 5): CommentInclude {
  if (depth === 0) {
    return {
      user: true,
      parent: true,
      replies: { include: { user: true, parent: true } }
    } as CommentInclude;
  }
  
  return {
    user: true,
    parent: true,
    replies: {
      include: createCommentInclude(depth - 1)
    }
  };
}

async function getBlogPost(slug: string) {
  try {
    const session = await auth()
    
    const post = await prisma.blog.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
            _count: {
              select: {
                followers: true
              }
            }
          }
        },
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
        comments: {
          include: createCommentInclude(),
          orderBy: {
            createdAt: 'desc'
          },
          where: {
            parentId: null
          }
        },
      },
    })

    if (!post) {
      return null
    }

    // Get unique view count - wrap in try/catch to prevent errors
    let uniqueViews = 0;
    try {
      const views = await prisma.blogView.groupBy({
        by: ['userId'],
        where: {
          blogId: post.id,
          userId: { not: null }, // Only count logged-in users
        },
      })
      uniqueViews = views.length;
    } catch (viewError) {
      console.error('Error getting view count:', viewError);
      // Continue with zero views rather than failing
    }

    // Record view - wrap in try/catch to prevent errors
    try {
      await recordView(post.id);
    } catch (recordError) {
      console.error('Error recording view:', recordError);
      // Continue without recording view rather than failing
    }

    return {
      ...post,
      uniqueViews
    }
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw new Error(`Failed to fetch blog post: ${error instanceof Error ? error.message : String(error)}`);
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

// Update the BlogPost interface to match the actual data structure
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
    bio: string | null
    _count: {
      followers: number
    }
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
  comments: Array<{
    id: string
    content: string
    createdAt: Date
    user: {
      id: string
      name: string | null
      image: string | null
      username: string | null
    }
    reactions: Array<{
      id: string
      emoji: string
      userId: string
      user: {
        id: string
        name: string | null
        image: string | null
      }
    }>
    parent: { id: string } | null
    replies: Array<Comment>
    _count: {
      reactions: number
      replies: number
    }
  }>
}

// Add this function near the top of the file, after imports
function generateJsonLd(post: any) {
  // Add null checks for post.user
  const userName = post.user?.name || 'Anonymous'
  const userUsername = post.user?.username || 'anonymous'
  const userBio = post.user?.bio || ''
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://byteinit.com'

  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || '',
    image: post.coverImage || `${baseUrl}/og-image.jpg`,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: userName,
      url: `${baseUrl}/u/${userUsername}`,
      description: userBio
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Site Name',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: '190',
        height: '60'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`
    },
    keywords: post.tags.join(', '),
    articleBody: post.content.replace(/<[^>]*>/g, ''),
    wordCount: post.content.split(/\s+/).length,
    articleSection: post.tags[0] || 'Blog',
    inLanguage: 'en',
    timeRequired: `PT${calculateReadingTime(post.content)}M`,
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/'
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Blog',
        item: `${baseUrl}/blog`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: `${baseUrl}/blog/${post.slug}`
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

  // Remove headers() usage and use a hardcoded base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://byteinit.com'
  const readingTime = calculateReadingTime(post.content)

  // Add null checks for post.user
  const userName = post.user?.name || 'Anonymous'
  const userUsername = post.user?.username || 'anonymous'

  return {
    title: `${post.title} | Your Blog Name`,
    description: post.summary || undefined,
    keywords: post.tags,
    authors: [{ name: userName, url: `${baseUrl}/u/${userUsername}` }],
    creator: userName,
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
      authors: [`${baseUrl}/u/${userUsername}`],
      tags: post.tags,
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        }
      ] : undefined,
      url: `${baseUrl}/blog/${post.slug}`,
      siteName: 'Your Site Name',
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
      'article:author': userName,
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

// Add dynamic export to make the page dynamic
export const dynamic = 'force-dynamic'

// First, update the getRelatedPosts function to use proper typing
async function getRelatedPosts(currentPostId: string, userId: string) {
  const relatedPosts = await prisma.blog.findMany({
    where: {
      AND: [
        { published: true },
        { id: { not: currentPostId } },
        { userId: userId },
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

// Add this new component
const CommentSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="flex items-start gap-2">
      <div className="h-8 w-8 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-12 w-full bg-muted rounded" />
      </div>
    </div>
    {/* Nested reply skeleton */}
    <div className="ml-8 pl-4 border-l space-y-4">
      <div className="flex items-start gap-2">
        <div className="h-6 w-6 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-8 w-full bg-muted rounded" />
        </div>
      </div>
    </div>
  </div>
)

// First define a base comment type without replies
interface BaseComment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
    username: string | null
  }
  reactions: Array<{
    id: string
    emoji: string
    userId: string
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
  parent: { id: string } | null
  _count: {
    reactions: number
    replies: number
  }
}

// Rename to avoid conflict with existing Comment type
interface BlogComment extends BaseComment {
  replies: BaseComment[]
}

// First, add this helper function at the top of the file
function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// Update the formatTagForUrl function to match the blog card format
function formatTagForUrl(tag: string): string {
  // Just encode the tag as-is to maintain spaces and special characters
  return encodeURIComponent(tag)
}

interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
}

interface CommentReaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SerializedComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  reactions: CommentReaction[];
  replies: SerializedComment[];
  _count: {
    reactions: number;
    replies: number;
  };
}

// First, add these type definitions at the top of the file
interface CommentNode {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  _count: {
    reactions: number;
    replies: number;
  };
  replies: CommentNode[];
}

// Update the getComments function
async function getComments(postId: string): Promise<SerializedComment[]> {
  try {
    console.log('Fetching comments for post:', postId);

    // Get all comments for the post
    const comments = await prisma.comment.findMany({
      where: {
        blogId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        },
        _count: {
          select: {
            reactions: true,
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Create a map to store all comments
    const commentMap = new Map<string, CommentNode>();
    
    // First pass: Initialize the map with all comments
    comments.forEach(comment => {
      // Ensure user is not null before adding to map
      if (comment.user) {
        commentMap.set(comment.id, {
          ...comment,
          user: comment.user, // Ensure user is not null
          replies: []
        });
      }
    });

    // Second pass: Build the comment tree
    const rootComments: CommentNode[] = [];
    comments.forEach(comment => {
      // Skip comments with null user
      if (!comment.user) return;
      
      const commentNode = commentMap.get(comment.id);
      if (!commentNode) return; // Skip if not in map
      
      if (comment.parentId) {
        // This is a reply - add it to its parent's replies
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentNode);
          // Sort replies by creation date
          parentComment.replies.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          // If parent not found, treat as root comment
          rootComments.push(commentNode);
        }
      } else {
        // This is a root comment
        rootComments.push(commentNode);
      }
    });

    // Helper function to serialize a comment node
    const serializeComment = (comment: CommentNode): SerializedComment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      user: comment.user,
      reactions: comment.reactions
        .filter(reaction => reaction.user !== null)
        .map(reaction => ({
          id: reaction.id,
          emoji: reaction.emoji,
          userId: reaction.userId || '',
          user: reaction.user || {
            id: '',
            name: '',
            image: null
          }
        })),
      _count: comment._count,
      replies: comment.replies.map(reply => serializeComment(reply))
    });

    // Serialize the comment tree
    const serializedComments = rootComments.map(comment => serializeComment(comment));
    console.log('Processed comments:', serializedComments.length);
    return serializedComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    // Return empty array instead of throwing
    return [];
  }
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params
    const post = await getBlogPost(slug)
    
    if (!post) notFound()

    console.log('Post details:', {
      id: post.id,
      commentCount: post._count.comments
    });

    // Safely get comments with error handling
    let comments: SerializedComment[] = [];
    try {
      comments = await getComments(post.id);
      console.log('Comments returned:', comments.length);
    } catch (commentError) {
      console.error('Error fetching comments:', commentError);
    }

    const session = await auth()

    // Safely get related posts with error handling
    let relatedPosts: any[] = [];
    try {
      relatedPosts = await getRelatedPosts(post.id, post.userId);
    } catch (relatedError) {
      console.error('Error fetching related posts:', relatedError);
    }
    
    // Process content with error handling
    let toc: any[] = [];
    let processedContent = '';
    try {
      const tocResult = generateTableOfContents(post.content);
      toc = tocResult.toc;
      processedContent = processCodeBlocks(tocResult.content);
    } catch (contentError) {
      console.error('Error processing content:', contentError);
      processedContent = post.content; // Fallback to unprocessed content
    }

    const readingTime = calculateReadingTime(post.content)
    const publishedDate = new Date(post.createdAt)
    
    // Generate structured data with null safety
    let structuredData = {};
    try {
      if (post.user) {
        structuredData = generateJsonLd({
          title: post.title,
          summary: post.summary,
          coverImage: post.coverImage,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          user: {
            name: post.user.name,
            username: post.user.username,
            bio: post.user.bio
          },
          tags: post.tags,
          content: post.content,
          slug: post.slug
        });
      }
    } catch (structuredDataError) {
      console.error('Error generating structured data:', structuredDataError);
    }

    const isOwnProfile = session?.user?.id === post.user?.id

    // Get follow stats and status with error handling
    let followStats = { followers: 0, following: 0 };
    let isFollowing = false;
    
    try {
      if (post.user) {
        followStats = await getFollowStats(post.user.id);
        
        if (session?.user) {
          const userFollowing = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { followingIds: true }
          });
          
          isFollowing = userFollowing?.followingIds.includes(post.user.id) || false;
        }
      }
    } catch (followError) {
      console.error('Error getting follow data:', followError);
    }

    return (
      <>
        <StickyHeaderClient post={post} />
        {/* Add JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Add max-width container to prevent overflow */}
        <div className="max-w-screen-xl mx-auto">
          <article className="w-full min-h-screen bg-background relative" itemScope itemType="https://schema.org/BlogPosting">
            {/* Add semantic HTML and microdata */}
            <meta itemProp="headline" content={post.title} />
            <meta itemProp="description" content={post.summary || ''} />
            <meta itemProp="author" content={post.user?.name || 'Anonymous'} />
            <meta itemProp="datePublished" content={post.createdAt.toISOString()} />
            <meta itemProp="dateModified" content={post.updatedAt.toISOString()} />
            {post.coverImage && <meta itemProp="image" content={post.coverImage} />}
            
            {/* Rest of your existing JSX with added semantic markup */}
            <header className="relative mb-8 px-4 pt-6">
              <div className="max-w-[900px] mx-auto">
                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                  {/* Author and Metadata */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Author info and avatar */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <Avatar className="h-8 w-8 border-2 border-background shadow-sm flex-shrink-0">
                          <AvatarImage src={post.user?.image || ""} alt={post.user?.name || "Anonymous"} />
                          <AvatarFallback>{post.user?.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 sm:block">
                            <Link 
                              href={`/u/${post.user?.username || "anonymous"}`}
                              className="text-sm font-medium hover:underline inline-block"
                            >
                              {post.user?.name || "Anonymous"}
                            </Link>
                            
                            {/* Follow Button - Only visible on mobile */}
                            {session?.user && !isOwnProfile && post.user?.username && (
                              <div className="flex-shrink-0 sm:hidden">
                                <FollowButton 
                                  username={post.user.username} 
                                  isFollowing={isFollowing ?? false}
                                  followerCount={followStats.followers}
                                />
                              </div>
                            )}
                          </div>
                          <BlogStats
                            followerCount={followStats.followers}
                            readingTime={readingTime}
                            views={post.uniqueViews}
                            publishDate={publishedDate}
                          />
                        </div>
                      </div>

                      {/* Follow Button - Only visible on larger screens */}
                      {session?.user && !isOwnProfile && post.user?.username && (
                        <div className="hidden sm:block flex-shrink-0">
                          <FollowButton 
                            username={post.user.username} 
                            isFollowing={isFollowing ?? false}
                            followerCount={followStats.followers}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title and Summary */}
                <div className="space-y-3 mb-4">
                  <h1 itemProp="headline" className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
                    {post.title}
                  </h1>
                  {post.summary && (
                    <p itemProp="description" className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {post.summary}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {post.tags.map((tag: string) => (
                    <Link 
                      key={tag} 
                      href={`/blog/tag/${formatTagForUrl(tag)}`}
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

            {/* Main content section - Add overflow-hidden */}
            <div itemProp="articleBody" className="px-4 py-6 overflow-hidden">
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
                      <AvatarImage src={post.user?.image || ""} alt={post.user?.name || ""} />
                      <AvatarFallback>{post.user?.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/u/${post.user?.username || "anonymous"}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {post.user?.name || "Anonymous"}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {post.user?.bio || "No bio available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Related Posts - Only show if there are posts */}
                {relatedPosts.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h2 className="text-sm font-medium mb-3">More from {post.user?.name}</h2>
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
                )}

                {/* Comments Section - removed border-t */}
                <div className="mt-12 pt-6"> {/* Removed border-t */}
                  {/* Comments Section with Suspense and loading state */}
                  <React.Suspense 
                    fallback={
                      <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Discussion ({post._count.comments})</h2>
                        <CommentSkeleton />
                      </div>
                    }
                  >
                    <CommentSection 
                      postId={post.id}
                      comments={comments}
                      commentCount={post._count.comments}
                      session={session}
                      onAddComment={addComment}
                      onDeleteComment={deleteComment}
                      onEditComment={editComment}
                      onAddReaction={toggleCommentReaction}
                    />
                  </React.Suspense>
                </div>
              </div>
            </div>
          </article>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error in BlogPost component:', error);
    return (
      <>
        <StickyHeaderClient post={null} />
        <div className="max-w-screen-xl mx-auto">
          <article className="w-full min-h-screen bg-background relative">
            <header className="relative mb-8 px-4 pt-6">
              <div className="max-w-[900px] mx-auto">
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 border-2 border-background shadow-sm flex-shrink-0">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 sm:block">
                          <span className="text-sm font-medium">Error loading post</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          </article>
        </div>
      </>
    );
  }
} 