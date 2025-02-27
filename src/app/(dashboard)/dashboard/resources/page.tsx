// src/app/(dashboard)/dashboard/resources/page.tsx
import { Suspense } from "react"
import { prisma } from "@/prisma"
import { auth } from "@/auth"
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Edit, 
  ExternalLink, 
  Check, 
  Calendar, 
  Heart,
  Bookmark,
  TrendingUp, 
  X,
  Plus
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { DeleteResourceButton } from "@/components/resources/DeleteResourceButton"
import type { ResourceCategory, ResourceType } from "@prisma/client"
import { revalidatePath } from "next/cache"

type SortOption = {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

const sortOptions: SortOption[] = [
  { label: 'Most Recent', value: 'date', icon: Calendar },
  { label: 'Most Liked', value: 'likes', icon: Heart },
  { label: 'Most Saved', value: 'saves', icon: Bookmark },
  { label: 'Most Popular', value: 'popular', icon: TrendingUp },
]

const filterOptions = [
  { label: 'All Resources', value: 'all' },
  { label: 'Libraries', value: 'LIBRARY' },
  { label: 'Tools', value: 'TOOL' },
  { label: 'Frameworks', value: 'FRAMEWORK' },
  { label: 'Tutorials', value: 'TUTORIAL' },
  { label: 'Templates', value: 'TEMPLATE' },
  { label: 'Icons', value: 'ICON_SET' },
  { label: 'Components', value: 'COMPONENT_LIBRARY' },
  { label: 'APIs', value: 'API' },
  { label: 'Documentation', value: 'DOCUMENTATION' },
  { label: 'Courses', value: 'COURSE' },
] as const

type SearchParams = {
  query?: string
  sort?: string
  filter?: (typeof filterOptions)[number]['value']
}

type Resource = {
  id: string
  title: string
  description: string
  url: string
  type: ResourceType
  category: ResourceCategory
  tags: string[]
  totalViews: number
  likes: number
  saves: number
  createdAt: Date
  updatedAt: Date
  userId: string
  _count: {
    interactions: number
    savedResources: number
  }
}

async function deleteResource(resourceId: string) {
  'use server'
  
  try {
    await prisma.resource.delete({
      where: { id: resourceId }
    })
    // Optionally add a success message or revalidation
    revalidatePath('/dashboard/resources')
    return { success: true }
  } catch (error) {
    console.error('Error deleting resource:', error)
    return { success: false, error: 'Failed to delete resource' }
  }
}

// First, create a loading skeleton component
function ResourcesTableSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
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

// Update the main component to use Suspense and handle empty state
export default async function ResourcesDashboard({
  params,
  searchParams,
}: {
  params: Promise<{}>;
  searchParams: Promise<SearchParams> | undefined;
}) {
  await params; // Await params, even if not used
  const actualSearchParams = await searchParams;
  const query = actualSearchParams?.query || '';
  const sort = actualSearchParams?.sort || 'date';
  const filter = actualSearchParams?.filter || 'all';
  const session = await auth();
  
  const resources = await prisma.resource.findMany({
    where: { 
      userId: session?.user?.id,
      AND: [
        query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } }
          ]
        } : {},
        filter !== 'all' ? { type: filter as ResourceType } : {},
      ]
    },
    orderBy: sort === 'popular' 
      ? [{ likes: 'desc' }, { saves: 'desc' }]
      : sort === 'date' 
      ? [{ createdAt: 'desc' }]
      : sort === 'likes'
      ? [{ likes: 'desc' }]
      : sort === 'saves'
      ? [{ saves: 'desc' }]
      : [{ createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          interactions: true,
          savedResources: true,
        }
      }
    }
  })

  return (
    <div className="-m-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 sm:px-8 py-4 border-b">
          <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
            {/* Search */}
            <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <form className="relative" action="/dashboard/resources">
                <Input
                  name="query"
                  defaultValue={query}
                  placeholder="Search resources..."
                  className="pl-9 pr-9 h-9 bg-muted/40 border-muted-foreground/10 hover:border-muted-foreground/20"
                />
                {query && (
                  <Link
                    href="/dashboard/resources"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Link>
                )}
              </form>
            </div>

            {/* Filters and Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-2 lg:px-3 border-muted-foreground/10"
                  >
                    <SlidersHorizontal className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">
                      {filterOptions.find(option => option.value === filter)?.label || 'All Resources'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Filter Resources</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filterOptions.map((option) => (
                    <DropdownMenuItem key={option.value} asChild>
                      <Link
                        href={`/dashboard/resources?${new URLSearchParams({
                          ...(query ? { query } : {}),
                          ...(sort !== 'date' ? { sort } : {}),
                          ...(option.value !== 'all' ? { filter: option.value } : {})
                        })}`}
                        className="flex items-center justify-between py-1.5"
                      >
                        {option.label}
                        {filter === option.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-2 lg:px-3 border-muted-foreground/10"
                  >
                    <ArrowUpDown className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">
                      {sortOptions.find(option => option.value === sort)?.label || 'Sort'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Sort Resources</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem key={option.value} asChild>
                      <Link 
                        href={`/dashboard/resources?${new URLSearchParams({
                          ...(query ? { query } : {}),
                          ...(option.value !== 'date' ? { sort: option.value } : {}),
                          ...(filter !== 'all' ? { filter } : {})
                        })}`}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div className="flex items-center">
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {option.label}
                        </div>
                        {sort === option.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <Suspense fallback={<ResourcesTableSkeleton />}>
          {resources.length > 0 ? (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <Table className="[&_tr:last-child]:border-0 [&_tr:hover]:bg-muted/50 [&_td]:py-4">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[400px] text-xs font-medium">Resource</TableHead>
                    <TableHead className="w-[100px] text-right text-xs font-medium">Category</TableHead>
                    <TableHead className="w-[80px] text-right text-xs font-medium">Type</TableHead>
                    <TableHead className="w-[100px] text-right text-xs font-medium">Date</TableHead>
                    <TableHead className="w-[70px] text-right text-xs font-medium">Likes</TableHead>
                    <TableHead className="w-[70px] text-right text-xs font-medium">Saves</TableHead>
                    <TableHead className="w-[100px] text-right text-xs font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id} className="group border-border/50">
                      <TableCell>
                        <div className="space-y-1.5">
                          <Link 
                            href={`/dashboard/resources/${resource.id}`}
                            className="font-medium hover:text-primary transition-colors line-clamp-1 block"
                          >
                            {resource.title}
                          </Link>
                          <div className="text-sm text-muted-foreground/80 line-clamp-2">
                            {resource.description}
                          </div>
                          {resource.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {resource.tags.slice(0, 3).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-muted/50 text-[11px] rounded-full font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                              {resource.tags.length > 3 && (
                                <span className="text-[11px] text-muted-foreground">
                                  +{resource.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          "bg-blue-100/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-500"
                        )}>
                          {resource.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          "bg-purple-100/50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-500"
                        )}>
                          {resource.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-muted-foreground/80">
                          {formatDistanceToNowStrict(new Date(resource.createdAt))} ago
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className="text-sm text-muted-foreground/80">{resource.likes}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className="text-sm text-muted-foreground/80">{resource.saves}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            asChild
                          >
                            <Link href={`/dashboard/resources/edit/${resource.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit resource</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-muted"
                            asChild
                          >
                            <Link 
                              href={`/resources/${resource.id}`}
                              target="_blank"
                              className="relative group/tooltip"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">View resource</span>
                              <span className="absolute -top-9 right-0 w-fit px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-sm invisible group-hover/tooltip:visible whitespace-nowrap">
                                View resource
                              </span>
                            </Link>
                          </Button>
                          <DeleteResourceButton 
                            resourceId={resource.id} 
                            deleteResource={deleteResource}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <SlidersHorizontal className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="mt-6 text-xl font-semibold">No resources found</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
                  {query 
                    ? `No resources match your search for "${query}". Try adjusting your filters or search terms.`
                    : filter !== 'all'
                    ? `No resources found in the "${filterOptions.find(f => f.value === filter)?.label}" category.`
                    : 'Start by adding your first resource to share with the community.'}
                </p>
                <div className="mt-6 flex gap-3">
                  {(query || filter !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href="/dashboard/resources">
                        Clear filters
                      </Link>
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    asChild
                  >
                    <Link href="resources/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Resource
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}