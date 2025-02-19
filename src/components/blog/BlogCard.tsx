"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, MessageCircle, Bookmark, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { vote, toggleSave } from "@/app/(blog)/blog/actions"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { BlogPostActions } from "./BlogPostActions"

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
    }
    _count: {
      votes: number
      comments: number
      saves: number
    }
    votes: Array<{ type: 'UP' | 'DOWN' }>
    saves: Array<{ id: string }>
    createdAt: Date
    tags: string[]
  }
}

function stripHtml(html: string) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default function BlogCard({ post }: BlogCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = stripHtml(content).trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  return (
    <Card className="w-full hover:bg-accent/5 transition-colors duration-200 shadow-none border-[0.5px]">
      <div className="flex items-start p-4 gap-4">
        <BlogPostActions.Vote post={post} />

        <div className="flex-1 min-w-0 space-y-1">
          <Link href={`/blog/${post.slug}`} className="group">
            <h2 className="text-base font-medium group-hover:text-primary transition-colors line-clamp-1">
              {post.title}
            </h2>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.summary || stripHtml(post.content)}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={post.user?.image || undefined} />
              <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span>{post.user?.name}</span>
            <span>•</span>
            <time dateTime={post.createdAt.toISOString()}>{new Date(post.createdAt).toLocaleDateString()}</time>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{calculateReadingTime(post.content)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full hover:bg-secondary/80 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <BlogPostActions.Secondary post={post} />
          </div>
        </div>
      </div>
    </Card>
  )
}

