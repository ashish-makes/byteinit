"use client"

import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Clock, MessageSquare, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BlogPostActions } from "./BlogPostActions"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BlogReactions } from "./BlogReactions"
import { UserHoverCard } from "@/components/UserHoverCard"

interface BlogCardProps {
  post: {
    id: string
    title: string
    content: string
    summary: string | null
    slug: string
    user: {
      name: string | null
      image: string | null
      username: string | null
    } | null
    _count: {
      votes: number
      comments: number
      saves: number
    }
    votes: Array<{ type: 'UP' | 'DOWN'; userId?: string | null }>
    saves: Array<{ id: string; userId?: string | null }>
    createdAt: Date
    tags: string[]
    userId?: string | null
  }
}

function stripHtml(html: string) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default function BlogCard({ post }: BlogCardProps) {
  const handleUnauthenticatedAction = () => {
    toast.error("Please sign in to interact with posts")
  }

  function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = stripHtml(content).trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  function formatDate(date: Date) {
    const distance = formatDistanceToNow(new Date(date), { addSuffix: true })
    const fullDate = format(new Date(date), 'MMM d, yyyy')
    
    return {
      relative: distance,
      full: fullDate
    }
  }

  return (
    <Card className="w-full hover:bg-accent/5 transition-colors duration-200 shadow-none border-[0.5px] mb-2">
      <div className="flex items-start p-4 gap-4">
        <BlogPostActions.Vote 
          post={post} 
          onUnauthenticated={handleUnauthenticatedAction}
        />

        <div className="flex-1 min-w-0 space-y-2">
          <Link href={`/blog/${post.slug}`} className="group">
            <h2 className="text-base font-medium group-hover:text-primary transition-colors line-clamp-1">
              {post.title}
            </h2>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.summary || stripHtml(post.content)}
          </p>

          {/* Metadata - Desktop */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={post.user?.image || ""} />
              <AvatarFallback>{post.user?.name?.[0] || "A"}</AvatarFallback>
            </Avatar>
            <UserHoverCard username={post.user?.username || null}>
              <span className="truncate cursor-pointer hover:text-foreground transition-colors">{post.user?.name || "Anonymous"}</span>
            </UserHoverCard>
            <span>•</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDate(post.createdAt).relative}
                  </time>
                </TooltipTrigger>
                <TooltipContent>
                  {formatDate(post.createdAt).full}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{calculateReadingTime(post.content)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{post._count.comments}</span>
            </div>
          </div>

          {/* Metadata - Mobile */}
          <div className="flex sm:hidden items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-fit">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.user?.image || ""} />
                <AvatarFallback>{post.user?.name?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <UserHoverCard username={post.user?.username || null}>
                <span className="truncate cursor-pointer hover:text-foreground transition-colors">{post.user?.name || "Anonymous"}</span>
              </UserHoverCard>
            </div>
            <span>•</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDate(post.createdAt).relative}
                  </time>
                </TooltipTrigger>
                <TooltipContent>
                  {formatDate(post.createdAt).full}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>•</span>
            <span>{calculateReadingTime(post.content)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{post._count.comments}</span>
            </div>
          </div>

          {/* Add BlogReactions component without counts */}
          <BlogReactions slug={post.slug} variant="stacked" className="mt-2" />

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-wrap gap-1 max-w-[85%]">
              {post.tags.slice(0, 7).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full hover:bg-secondary/80 transition-colors truncate"
                >
                  #{tag}
                </Link>
              ))}
              {post.tags.length > 7 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full hover:bg-secondary/80 transition-colors">
                      <MoreHorizontal className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {post.tags.slice(7).map((tag) => (
                          <span key={tag} className="text-xs">#{tag}</span>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <BlogPostActions.Secondary 
              post={post} 
              onUnauthenticated={handleUnauthenticatedAction}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

