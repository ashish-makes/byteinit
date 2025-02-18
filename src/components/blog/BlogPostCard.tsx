"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNowStrict } from "date-fns"
import { MessageCircle, Clock, Edit, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BlogPostCardProps {
  post: any
  href: string
  actions?: React.ReactNode
}

export function BlogPostCard({ post, href }: BlogPostCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const router = useRouter()

  function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/blog/${post.slug}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast.success("Post deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete post")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="group hover:bg-muted/50 transition-colors duration-200 shadow-none border-0 bg-transparent">
        <div className="flex items-start p-3 gap-3">
          {post.coverImage && (
            <div className="relative w-[80px] h-[80px] rounded overflow-hidden shrink-0">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Link href={href} className="group block">
                <h2 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {post.title}
                </h2>
              </Link>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                  <Link href={href}>
                    <Edit className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-destructive hover:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {post.summary && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.summary}</p>
            )}

            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={post.user.image} />
                  <AvatarFallback>{post.user.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="line-clamp-1">{post.user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>•</span>
                <time>{formatDistanceToNowStrict(new Date(post.createdAt))} ago</time>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{calculateReadingTime(post.content)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{post._count?.comments || 0}</span>
                </div>
              </div>
            </div>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 