/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense } from "react"
import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { PlusCircle, Edit, Trash2, MessageSquare, Clock, Search, Filter, Heart, Bookmark, Share2, Eye, ArrowBigUp, ArrowBigDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNowStrict } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BlogTableSkeleton } from "@/components/blog/BlogTableSkeleton"
import { toggleLike, toggleSave, vote } from "./actions"
import { cn } from "@/lib/utils"
import { DeletePostButton } from "@/components/blog/DeletePostButton"

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

async function deletePost(postId: string) {
  'use server'
  await prisma.blog.delete({
    where: { id: postId }
  })
}

export default async function BlogDashboard() {
  const session = await auth()
  
  const posts = await prisma.blog.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          saves: true,
          views: true,
          votes: true,
        }
      },
      likes: {
        where: {
          userId: session?.user?.id
        },
        take: 1
      },
      saves: {
        where: {
          userId: session?.user?.id
        },
        take: 1
      },
      votes: {
        where: {
          userId: session?.user?.id
        },
        take: 1
      }
    }
  })

  return (
    <div className="h-full bg-background">
      <div className="px-6 py-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Content Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and track your published articles
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/dashboard/blog/new">
                <PlusCircle className="h-4 w-4" />
                New Article
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<BlogTableSkeleton />}>
            {posts.length > 0 ? (
              <div className="rounded-lg border bg-card shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Article</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Saves</TableHead>
                      <TableHead>Votes</TableHead>
                      <TableHead>Reading Time</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted">
                              {post.coverImage ? (
                                <Image
                                  src={post.coverImage}
                                  alt={post.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <PlusCircle className="h-5 w-5 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link 
                                href={`/dashboard/blog/${post.slug}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-1"
                              >
                                {post.title}
                              </Link>
                              {post.tags?.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  {post.tags.slice(0, 2).map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 bg-muted text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{post._count?.views || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span>{post._count?.comments || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <form action={async () => {
                            'use server'
                            await toggleLike(post.id)
                          }}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "flex items-center gap-2",
                                post.likes.length > 0 && "text-red-500"
                              )}
                            >
                              <Heart className={cn(
                                "h-4 w-4",
                                post.likes.length > 0 && "fill-current"
                              )} />
                              <span>{post._count?.likes || 0}</span>
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell>
                          <form action={async () => {
                            'use server'
                            await toggleSave(post.id)
                          }}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={cn(
                                "flex items-center gap-2",
                                post.saves.length > 0 && "text-primary"
                              )}
                            >
                              <Bookmark className={cn(
                                "h-4 w-4",
                                post.saves.length > 0 && "fill-current"
                              )} />
                              <span>{post._count?.saves || 0}</span>
                            </Button>
                          </form>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <form action={async () => {
                              'use server'
                              await vote(post.id, 'UP')
                            }}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className={cn(
                                  "p-0 h-8 w-8",
                                  post.votes[0]?.type === 'UP' && "text-green-500"
                                )}
                              >
                                <ArrowBigUp className="h-6 w-6" />
                              </Button>
                            </form>
                            <span className="text-sm font-medium">
                              {post.votes.reduce((acc, vote) => 
                                acc + (vote.type === 'UP' ? 1 : -1)
                              , 0)}
                            </span>
                            <form action={async () => {
                              'use server'
                              await vote(post.id, 'DOWN')
                            }}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className={cn(
                                  "p-0 h-8 w-8",
                                  post.votes[0]?.type === 'DOWN' && "text-red-500"
                                )}
                              >
                                <ArrowBigDown className="h-6 w-6" />
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{calculateReadingTime(post.content)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNowStrict(new Date(post.createdAt))} ago
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8"
                              asChild
                            >
                              <Link href={`/dashboard/blog/${post.slug}`}>
                                <Share2 className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8"
                              asChild
                            >
                              <Link href={`/dashboard/blog/${post.slug}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DeletePostButton postId={post.id} deletePost={deletePost} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border bg-card">
                <div className="mx-auto max-w-sm space-y-3">
                  <h3 className="text-lg font-semibold">No articles yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first article and start sharing your knowledge
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/dashboard/blog/new">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create First Article
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}