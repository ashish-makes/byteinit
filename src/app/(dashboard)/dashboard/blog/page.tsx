/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense } from "react"
import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { PlusCircle, Search, Filter, Edit, Trash2, ExternalLink, MessageSquare, Heart, Bookmark, ArrowUpDown, ArrowUp, ArrowDown, X, SlidersHorizontal, Calendar, TrendingUp, Eye, Check, PenSquare, Plus, ChevronDown } from "lucide-react"
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
import { toggleLike, toggleSave, vote } from "./actions"
import { cn } from "@/lib/utils"
import { DeletePostButton } from "@/components/blog/DeletePostButton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Metadata } from 'next'
import { FilterPanel } from "@/components/blog/FilterPanel"

type SortOption = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

const sortOptions: SortOption[] = [
  { label: 'Most Recent', value: 'date', icon: Calendar },
  { label: 'Most Viewed', value: 'views', icon: Eye },
  { label: 'Most Comments', value: 'comments', icon: MessageSquare },
  { label: 'Trending', value: 'trending', icon: TrendingUp },
]

const filterOptions = [
  { label: 'All Posts', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
  { label: 'With Comments', value: 'has-comments' },
  { label: 'Most Liked', value: 'most-liked' },
] as const

type SearchParams = {
  query?: string
  sort?: string
  filter?: (typeof filterOptions)[number]['value']
}

interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<SearchParams>;
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min`
}

function calculateVoteScore(upvotes: number, downvotes: number) {
  const total = upvotes + downvotes
  if (total === 0) return 0
  return (upvotes / total) * 100
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '')
}

async function deletePost(postId: string) {
  'use server'
  await prisma.blog.delete({
    where: { id: postId }
  })
}

function BlogTableSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
            <div className="relative aspect-[4/3] w-28 flex-shrink-0 rounded-lg bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-muted rounded"></div>
              <div className="h-8 w-16 bg-muted rounded"></div>
              <div className="h-8 w-24 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function BlogDashboard({ params, searchParams }: PageProps) {
  await params;
  const actualSearchParams = await searchParams;
  const query = actualSearchParams?.query || '';
  const sort = actualSearchParams?.sort || 'date';
  const filter = actualSearchParams?.filter || 'all';
  const session = await auth();
  
  const posts = await prisma.blog.findMany({
    where: { 
      userId: session?.user?.id,
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
                { tags: { has: query } },
              ],
            }
          : {},
        filter === 'published' ? { published: true } : {},
        filter === 'draft' ? { published: false } : {},
        filter === 'has-comments' ? { comments: { some: {} } } : {},
        filter === 'most-liked' ? { likes: { some: {} } } : {},
      ],
    },
    orderBy: [
      sort === 'date'
        ? { createdAt: 'desc' }
        : sort === 'views'
        ? { views: { _count: 'desc' } }
        : sort === 'comments'
        ? { comments: { _count: 'desc' } }
        : sort === 'trending'
        ? { likes: { _count: 'desc' } }
        : { createdAt: 'desc' },
    ],
    include: {
      user: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          saves: true,
          views: true,
          votes: true,
        },
      },
      likes: { where: { userId: session?.user?.id }, take: 1 },
      saves: { where: { userId: session?.user?.id }, take: 1 },
      votes: true,
    },
  });

  return (
    <div className="w-full">
      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<BlogTableSkeleton />}>
          {posts.length > 0 ? (
            <div className="rounded-xl bg-white dark:bg-card/40 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="[&_tr:last-child]:border-0 [&_tr:hover]:bg-muted/50 min-w-[920px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[400px] text-xs font-medium text-muted-foreground">Content</TableHead>
                      <TableHead className="w-[80px] text-right text-xs font-medium text-muted-foreground">Status</TableHead>
                      <TableHead className="w-[100px] text-right text-xs font-medium text-muted-foreground">Date</TableHead>
                      <TableHead className="w-[70px] text-right text-xs font-medium text-muted-foreground">Views</TableHead>
                      <TableHead className="w-[70px] text-right text-xs font-medium text-muted-foreground">Comments</TableHead>
                      <TableHead className="w-[90px] text-right text-xs font-medium text-muted-foreground">Votes</TableHead>
                      <TableHead className="w-[100px] text-right text-xs font-medium text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} className="group border-border/50">
                        <TableCell className="py-4">
                          <div className="flex items-start gap-4">
                            <div className="relative aspect-[4/3] w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                              {post.coverImage ? (
                                <Image
                                  src={post.coverImage}
                                  alt={post.title}
                                  fill
                                  className="object-cover transition-transform group-hover:scale-105"
                                  sizes="96px"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <PlusCircle className="h-4 w-4 text-muted-foreground/40" />
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-medium">
                                {calculateReadingTime(post.content)}
                              </div>
                            </div>
                            <div className="space-y-1 min-w-0 max-w-[260px] lg:max-w-[360px]">
                              <Link 
                                href={`/dashboard/blog/${post.slug}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-1 block"
                              >
                                {post.title}
                              </Link>
                              <div className="text-sm text-muted-foreground/80 line-clamp-1">
                                {stripHtml(post.content)}
                              </div>
                              {post.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {post.tags.slice(0, 2).map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 bg-muted/50 text-[11px] rounded-full font-medium text-muted-foreground/90"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {post.tags.length > 2 && (
                                    <span className="text-[11px] text-muted-foreground/70">
                                      +{post.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex justify-end">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              !post.published 
                                ? "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-500"
                                : "bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-500"
                            )}>
                              {!post.published ? 'Draft' : 'Live'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground/80">
                              {formatDistanceToNowStrict(new Date(post.createdAt))} ago
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
                            <span className="text-sm tabular-nums text-muted-foreground/80">
                              {post._count.views}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-end gap-1">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50" />
                            <span className="text-sm tabular-nums text-muted-foreground/80">
                              {post._count.comments}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="flex items-center gap-0.5 bg-muted/50 px-2 py-1 rounded-full">
                              <ArrowUp className={cn(
                                "h-3.5 w-3.5",
                                post.votes.some(v => v.type === 'UP') 
                                  ? "text-green-500" 
                                  : "text-muted-foreground/70"
                              )} />
                              <span className="tabular-nums text-xs font-medium px-0.5">
                                {post.votes.filter(v => v.type === 'UP').length}
                              </span>
                              <ArrowDown className={cn(
                                "h-3.5 w-3.5",
                                post.votes.some(v => v.type === 'DOWN') 
                                  ? "text-red-500" 
                                  : "text-muted-foreground/70"
                              )} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-muted"
                              asChild
                            >
                              <Link href={`/dashboard/blog/${post.slug}/edit`}>
                                <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="sr-only">Edit post</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-primary hover:bg-muted"
                              asChild
                            >
                              <Link 
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                className="relative group/tooltip"
                              >
                                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="sr-only">View post</span>
                                <span className="absolute -top-9 right-0 w-fit px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-sm invisible group-hover/tooltip:visible whitespace-nowrap">
                                  View post
                                </span>
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
            </div>
          ) : (
            <div className="rounded-xl bg-white dark:bg-card/40 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <PenSquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-xl font-semibold">No blog posts found</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
                  {query 
                    ? `No posts match your search for "${query}". Try adjusting your filters or search terms.`
                    : filter !== 'all'
                    ? `No posts found in the selected filter.`
                    : 'Start by creating your first blog post to share your thoughts with the world.'}
                </p>
                <div className="mt-6 flex gap-3">
                  {(query || filter !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href="/dashboard/blog">
                        Clear filters
                      </Link>
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    asChild
                  >
                    <Link href="/dashboard/blog/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Suspense>
      </div>

      {/* Filter Panel */}
      <FilterPanel query={query} sort={sort} filter={filter} />
    </div>
  );
}



