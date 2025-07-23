/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileText,
  Bookmark,
  Heart,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Pencil,
  Trash2,
  CalendarRange,
  CalendarDays,
  Timer,
  ChevronDown,
  Check,
  Activity,
  FolderOpenDot,
  Folder,
  Link2,
  Copy,
  ExternalLink,
  X,
  Eye,
  ArrowUp,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Plus,
  BookMarked,
  Settings,
  Users,
  Filter,
  Tags,
  MessageSquare,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import type { LucideIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from "@/lib/utils"

// Import Recharts components for AreaChart
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"

// Import shadcn UI chart components
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Import shadcn UI Dropdown components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// Import Recharts components for PieChart
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

// Import Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Add after imports
type TimeRange = 'today' | '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

// Add this type near the top with other type definitions
type ContentType = 'resources' | 'blog';

// Add these types near the top with other type definitions
type ContentStatus = 'draft' | 'live';

// Update the content filter type definition near the top
type ContentFilterType = 'all' | 'post' | 'resource';

interface ContentItem {
  id: string;
  type: 'post' | 'resource';
  title: string;
  summary: string;
  status: ContentStatus;
  uploadedAt: string;
  tags: string[];
  votes?: number;
  views?: number;
  saves: number;
  comments?: number;
  likes?: number;
  slug: string;
}

// Define the data type for the table
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  likes: number;
  saves: number;
  createdAt: string;
  userId: string;
  slug?: string;
}

// Define the data type for the chart
type ChartData = {
  date: string
  likes: number
  saves: number
  postViews: number
  postVotes: number
}[]

// Add these interfaces at the top with other interfaces
interface TopResource {
  id: string;
  title: string;
  likes: number;
  saves: number;
  views: number;
}

interface TopPost {
  id: string;
  title: string;
  views: number;
  votes: number;
}

// Add these URL helper functions (same as profile page)
const getDisplayUrl = (user: any) => {
  const identifier = user?.username || user?.email?.split('@')[0] || '';
  return `${window.location.origin}/u/${identifier}`;
};

const getNavigationUrl = (user: any) => {
  const identifier = user?.username || user?.email?.split('@')[0] || '';
  return `/u/${identifier}`;
};

// Add this helper function at the top of the file
const getUserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'UTC'; // Fallback to UTC if timezone detection fails
  }
};

// Add this interface with the existing interfaces
interface TrafficSource {
  name: string;
  value: number;
  color: string;
}

// First, add these interface updates at the top with other interfaces
interface QuickActionProps {
  icon: LucideIcon
  label: string
  description: string
  href: string
  color: string
}

// Update the QuickAction component with softer shadows
const QuickAction = ({ icon: Icon, label, description, href, color }: QuickActionProps) => (
  <Link 
    href={href}
    className={cn(
      "group relative flex flex-col justify-between p-6 rounded-xl bg-white",
      "hover:translate-y-[-2px] transition-all duration-300",
      "after:absolute after:inset-0 after:rounded-xl",
      "after:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]",
      "dark:bg-card/40 dark:after:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]",
      "dark:hover:bg-card/60"
    )}
  >
    <div className="flex items-start justify-between mb-8">
      <div 
        className="p-2.5 rounded-lg"
        style={{ backgroundColor: `${color}08` }}
      >
        <Icon 
          className="h-5 w-5" 
          style={{ color }} 
        />
      </div>
      <div 
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center opacity-0 -translate-x-2",
          "group-hover:opacity-100 group-hover:translate-x-0",
          "transition-all duration-300 ease-out"
        )}
        style={{ backgroundColor: `${color}08`, color }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          className="translate-x-[1px]"
        >
          <path 
            d="M3.33337 8H12.6667M12.6667 8L8.00004 3.33333M12.6667 8L8.00004 12.6667" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
    <div>
      <h3 className="font-medium text-base text-foreground/90 mb-1">{label}</h3>
      <p className="text-sm text-muted-foreground/80">{description}</p>
    </div>
  </Link>
)

// First, add this interface for the metric cards
interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: number
  trend: number
  loading: boolean
  color: string
}

// Update the MetricCard component without border
const MetricCard = ({ icon: Icon, label, value, trend, loading, color }: MetricCardProps) => (
  <div className={cn(
    "relative rounded-xl bg-white p-5",
    "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)]",
    "dark:bg-card/40 dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
  )}>
    <div className="flex gap-4">
      <div 
        className="p-2.5 rounded-lg h-fit"
        style={{ backgroundColor: `${color}10` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground/80">{label}</p>
          {!loading && trend !== 0 && (
            <div 
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full",
                trend > 0 ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
              )}
            >
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {value.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')
  const [contentType, setContentType] = useState<ContentType>('resources')
  const [stats, setStats] = useState({
    totalResources: { value: 0, trend: 0 },
    savedResources: { value: 0, trend: 0 },
    totalLikes: { value: 0, trend: 0 },
    monthlyResources: { value: 0, trend: 0 },
    totalPosts: { value: 0, trend: 0 },
    postViews: { value: 0, trend: 0 },
    postVotes: { value: 0, trend: 0 },
    monthlyPosts: { value: 0, trend: 0 },
  })
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<"asc" | "desc" | null>(null)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData>([])
  const [showProfileLink, setShowProfileLink] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([
    { name: 'Direct', value: 35, color: '#3b82f6' },
    { name: 'Social', value: 25, color: '#10b981' },
    { name: 'Search', value: 20, color: '#6366f1' },
    { name: 'Referral', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#64748b' },
  ]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [contentFilter, setContentFilter] = useState<ContentFilterType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Define chart configuration for shadcn UI
  const chartConfig = {
    likes: {
      label: "Likes",
      color: "#3b82f6",
    },
    saves: {
      label: "Saves",
      color: "#10b981",
    },
  }

  // Move setActiveIndex outside of render
  const [pieChartActiveIndex, setPieChartActiveIndex] = useState<number | undefined>();

  // Fix TypeScript error in the callback
  const handlePieEnter = useCallback((_: unknown, index: number) => {
    setPieChartActiveIndex(index);
  }, []);

  const handlePieLeave = useCallback(() => {
    setPieChartActiveIndex(undefined);
  }, []);

  // Update the useEffect to use the correct blog posts endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's resources
        const resourcesResponse = await fetch(`/api/resources?userId=${session?.user?.id}`)
        const allResources = await resourcesResponse.json()
        console.log('Resources response:', allResources)
        
        const userResources = allResources.filter(
          (resource: Resource) => resource.userId === session?.user?.id,
        )

        // Fetch user's blog posts
        let blogPosts = [];
        try {
          const blogResponse = await fetch(`/api/blog?userId=${session?.user?.id}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Blog Response Status:', blogResponse.status);
          
          if (blogResponse.ok) {
            blogPosts = await blogResponse.json();
            console.log('Raw Blog Data:', blogPosts);
          } else {
            console.error('Failed to fetch blog posts:', blogResponse.status);
            const errorText = await blogResponse.text();
            console.error('Response:', errorText);
          }
        } catch (error) {
          console.error('Error fetching blog posts:', error);
        }
            
        // Transform resources and blog posts into ContentItem format
        const resourceItems: ContentItem[] = userResources.map((resource: Resource) => ({
          id: resource.id,
          type: 'resource',
          title: resource.title || '',
          summary: resource.description || '',
          status: 'live',
          uploadedAt: resource.createdAt,
          tags: resource.category ? [resource.category] : [],
          likes: resource.likes || 0,
          saves: resource.saves || 0,
          views: 0,
          votes: 0,
          comments: 0,
          slug: resource.slug || ''
        }));

        const blogItems: ContentItem[] = blogPosts.map((post: any) => {
          // Safely access post._count
          const counts = {
            votes: post?._count?.votes || 0,
            saves: post?._count?.saves || 0,
            comments: post?._count?.comments || 0
          };

          return {
            id: post?.id || '',
            type: 'post',
            title: post?.title || '',
            summary: post?.summary || '',
            status: post?.published ? 'live' : 'draft',
            uploadedAt: post?.createdAt || new Date().toISOString(),
            tags: post?.tags || [],
            votes: counts.votes,
            views: post?.uniqueViews || 0,
            saves: counts.saves,
            comments: counts.comments,
            slug: post?.slug || ''
          };
        });

        console.log('Resource Items:', resourceItems);
        console.log('Blog Items:', blogItems);

        // Combine and sort by uploadedAt
        const combinedItems = [...resourceItems, ...blogItems].sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        console.log('Final Combined Items:', combinedItems);
        setContentItems(combinedItems);

        // Fetch saved resources stats
        const savedResponse = await fetch("/api/saved-resources/stats")
        const savesData = await savedResponse.json()
        
        // Fetch blog stats
        const blogStatsResponse = await fetch(`/api/blog/stats?userId=${session?.user?.id}`)
        const blogStats = await blogStatsResponse.json()
        console.log('Blog Stats Response:', blogStats);

        // Calculate total views from blog posts directly
        const totalViews = blogPosts.reduce((acc: number, post: any) => acc + (post.uniqueViews || 0), 0);
        console.log('Calculated Total Views:', totalViews);
        
        const now = new Date()
        const today = new Date(now.setHours(0, 0, 0, 0))
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // Helper function for date filtering
        const isInDay = (date: Date, targetDate: Date) => 
          date.getFullYear() === targetDate.getFullYear() &&
          date.getMonth() === targetDate.getMonth() &&
          date.getDate() === targetDate.getDate()

        // Calculate resources created today/yesterday
        const todayResources = userResources.filter((r: Resource) => 
          isInDay(new Date(r.createdAt), today)
        )
        const yesterdayResources = userResources.filter((r: Resource) => 
          isInDay(new Date(r.createdAt), yesterday)
        )

        // Calculate likes today/yesterday
        const todayVotes = userResources.reduce((acc: number, r: Resource) => {
          if (isInDay(new Date(r.createdAt), today)) {
            return acc + (r.likes || 0)
          }
          return acc
        }, 0)

        const yesterdayVotes = userResources.reduce((acc: number, r: Resource) => {
          if (isInDay(new Date(r.createdAt), yesterday)) {
            return acc + (r.likes || 0)
          }
          return acc
        }, 0)

        setStats({
          totalResources: {
            value: userResources.length,
            trend: calculateTrend(todayResources.length, yesterdayResources.length),
          },
          savedResources: {
            value: savesData.totalSaves || 0,
            trend: calculateTrend(savesData.todaySaves || 0, savesData.yesterdaySaves || 0),
          },
          totalLikes: {
            value: userResources.reduce((acc: number, r: Resource) => acc + (r.likes || 0), 0),
            trend: calculateTrend(todayVotes, yesterdayVotes),
          },
          monthlyResources: {
            value: todayResources.length,
            trend: calculateTrend(todayResources.length, yesterdayResources.length),
          },
          totalPosts: {
            value: blogPosts.length,
            trend: calculateTrend(blogStats.todayPosts, blogStats.yesterdayPosts),
          },
          postViews: {
            value: totalViews,
            trend: calculateTrend(blogStats.todayViews, blogStats.yesterdayViews),
          },
          postVotes: {
            value: blogPosts.reduce((acc: number, post: any) => acc + (post._count?.votes || 0), 0),
            trend: calculateTrend(blogStats.todayVotes, blogStats.yesterdayVotes),
          },
          monthlyPosts: {
            value: blogStats.monthlyPosts,
            trend: calculateTrend(blogStats.todayPosts, blogStats.yesterdayPosts),
          },
        })

        setResources(userResources)

        // Fetch chart data
        const fetchChartData = async () => {
          try {
            const timezone = getUserTimeZone();
            console.log('User Timezone:', timezone);

            const [resourcesResponse, blogResponse] = await Promise.all([
              fetch(`/api/resources/chart-data?userId=${session?.user?.id}&range=${selectedRange}&timezone=${timezone}`),
              fetch(`/api/blog/chart-data?userId=${session?.user?.id}&range=${selectedRange}&timezone=${timezone}`)
            ]);

            if (!resourcesResponse.ok || !blogResponse.ok) {
              console.error('Resource Response:', resourcesResponse.status);
              console.error('Blog Response:', blogResponse.status);
              throw new Error('Failed to fetch chart data');
            }

            const resourcesData = await resourcesResponse.json();
            const blogData = await blogResponse.json();

            console.log('Raw Resources Data:', resourcesData);
            console.log('Raw Blog Data:', blogData);

            // Create a map of all dates from both datasets
            const dateSet = new Set([
              ...resourcesData.map((item: any) => item.date),
              ...blogData.map((item: any) => item.date)
            ]);

            // Combine the data ensuring all dates have values
            const combinedData = Array.from(dateSet)
              .sort()
              .map(date => {
                const resourceItem = resourcesData.find((item: any) => item.date === date) || {};
                const blogItem = blogData.find((item: any) => item.date === date) || {};
                
                const dataPoint = {
                  date,
                  likes: Number(resourceItem.likes || 0),
                  saves: Number(resourceItem.saves || 0),
                  postViews: Number(blogItem.views || 0),
                  postVotes: Number(blogItem.votes || 0)
                };

                console.log('Data point for date:', date, dataPoint);
                return dataPoint;
              });

            console.log('Final Combined Data:', combinedData);
            setChartData(combinedData);
      } catch (error) {
            console.error("Error fetching chart data:", error);
            toast.error("Failed to fetch chart data");
          }
        };

    if (session?.user) {
          fetchChartData();
        }

      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session, selectedRange])

  useEffect(() => {
    // Check if user has dismissed the profile link card before
    const hasSeenProfileLink = localStorage.getItem('hasSeenProfileLink');
    setShowProfileLink(!hasSeenProfileLink);
  }, []);

  const dismissProfileLink = () => {
    localStorage.setItem('hasSeenProfileLink', 'true');
    setShowProfileLink(false);
    toast.success("Profile link moved to header and profile page");
  };

  const handleSort = (column: keyof Resource) => {
    const newSorting = sorting === "asc" ? "desc" : "asc"
    setSorting(newSorting)

    const sorted = [...resources].sort((a, b) => {
      const aValue = a[column] ?? '';
      const bValue = b[column] ?? '';
      if (aValue < bValue) return newSorting === "asc" ? -1 : 1;
      if (aValue > bValue) return newSorting === "asc" ? 1 : -1;
      return 0;
    });

    setResources(sorted)
  }

  const handleEdit = (id: string, type: 'post' | 'resource', slug?: string) => {
    if (type === 'post') {
      if (!slug) {
        toast.error("Unable to edit post: Missing slug");
        return;
      }
      router.push(`/dashboard/blog/${slug}/edit`);
    } else {
      router.push(`/dashboard/resources/edit/${id}`);
    }
  }

  const handleView = (id: string, type: 'post' | 'resource', slug?: string) => {
    if (type === 'post') {
      router.push(`/blog/${slug}`);
    } else {
      router.push(`/resources/${id}`);
    }
  };

  const handleDelete = async (id: string, type: 'post' | 'resource', slug?: string) => {
    setResourceToDelete(id);
    const endpoint = type === 'post' ? `/api/blog/${slug}` : `/api/resources/${id}`;
    
    toast.promise(
      fetch(endpoint, { method: "DELETE" }).then((response) => {
        if (response.ok) {
          setContentItems(items => items.filter(item => item.id !== id));
          return `${type === 'post' ? 'Post' : 'Resource'} deleted successfully`;
        } else {
          throw new Error(`Failed to delete ${type}`);
        }
      }),
      {
        loading: `Deleting ${type}...`,
        success: (message) => message,
        error: (error) => error.message,
      },
    );
  }

  // Update the formatDate helper function
  const formatDate = (value: string) => {
    const date = new Date(value);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Update the calculateTrend function to handle edge cases better
  const calculateTrend = (current: number, previous: number) => {
    // If both numbers are 0, there's no trend (0%)
    if (current === 0 && previous === 0) return 0;
    // If previous is 0 but current isn't, it's a 100% increase
    if (previous === 0) return 100;
    // Calculate percentage change
    const trend = ((current - previous) / previous) * 100;
    return Math.round(trend);
  }

  // Add this component to show key insights
  const PerformanceInsights = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Quick Insights</h3>
        </div>
        <div className="space-y-3">
          {/* Dynamic insights based on data */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="p-2 rounded-full bg-green-500/10">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Most Engaging Resource</p>
              <p className="text-xs text-muted-foreground mt-1">
                &ldquo;React Best Practices&rdquo; received 45% more engagement this week
              </p>
            </div>
          </div>
          {/* Add more insights... */}
        </div>
      </Card>
    );
  };

  // Remove the TopPerformersTable component definition and its interfaces
  interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    trend: number;
    loading: boolean;
    compact?: boolean;
  }

  const StatCard = ({ icon: Icon, label, value, trend, loading, compact }: StatCardProps) => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className={`flex items-center gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm ${
        compact ? 'flex-col items-start' : ''
      }`}
    >
      <div className="p-2 rounded-md bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className={`flex-1 ${compact ? 'w-full' : ''}`}>
        <div className="flex items-center justify-between">
          <p className={`font-semibold text-foreground/90 ${compact ? 'text-xl' : 'text-2xl'}`}>
            {loading ? <Skeleton className="h-7 w-12 rounded" /> : value}
          </p>
          {!loading && trend !== 0 && (
            <div className={`flex items-center gap-1 ${trend > 0 ? "text-green-500" : "text-red-500"} text-sm`}>
              {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );

  // Update the TrafficSourcesChart component to use the callbacks
  const TrafficSourcesChart = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Traffic Sources</h2>
            <p className="text-sm text-muted-foreground">Where your visitors come from</p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={trafficSources}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                dataKey="value"
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
                stroke="transparent"
              >
                {trafficSources.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={pieChartActiveIndex === undefined || pieChartActiveIndex === index ? 1 : 0.6}
                    style={{
                      filter: pieChartActiveIndex === index ? 'brightness(1.1)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }: { active?: boolean; payload?: Array<any> }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
                      <p className="text-sm font-medium">{data.name}</p>
                      <p className="text-2xl font-bold">{data.value}%</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {trafficSources.map((source, index) => (
            <div
              key={index}
              className="flex items-center gap-2 transition-colors hover:text-foreground"
              onMouseEnter={() => handlePieEnter(null, index)}
              onMouseLeave={handlePieLeave}
              style={{ opacity: pieChartActiveIndex === undefined || pieChartActiveIndex === index ? 1 : 0.6 }}
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{source.name}</span>
                <span className="text-xs text-muted-foreground">{source.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Add these handler functions before the return statement
  const handlePublish = async (id: string) => {
    try {
      const item = contentItems.find(item => item.id === id);
      if (!item) return;

      const endpoint = item.type === 'post' ? '/api/blog/publish' : '/api/resources/publish';
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to publish');

      // Update the item status in the local state
      setContentItems(items =>
        items.map(item =>
          item.id === id ? { ...item, status: 'live' } : item
        )
      );

      toast.success(`${item.type === 'post' ? 'Post' : 'Resource'} published successfully`);
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to publish');
    }
  };

  return (
    <>
      <Toaster />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 pb-8 bg-[#f9fafb] dark:bg-background min-h-screen px-4 sm:px-6 -mt-14 pt-14"
      >
        {/* Header Section */}
        <div className="flex flex-col gap-6 pt-6">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Welcome back, {session?.user?.name?.split(' ')[0] || "User"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here&apos;s what&apos;s happening with your content
              </p>
            </div>
          </div>

          {/* Profile Link Card - Only show if not dismissed */}
          <AnimatePresence mode="wait">
            {showProfileLink && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 rounded-xl",
                  "border bg-card/40 backdrop-blur-sm",
                  "transition-all duration-200"
                )}
              >
                {/* Close button - Mobile only */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissProfileLink}
                  className="absolute sm:hidden right-2 top-2 h-6 w-6 rounded-full shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="flex items-center gap-4 flex-1 min-w-0 pr-8 sm:pr-0">
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                    <Link2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-base text-foreground/90">
                      Your Profile is Ready! 
                      <span className="hidden xs:inline ml-2">🎉</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="px-2 py-0.5 text-sm rounded bg-muted truncate">
                        {getDisplayUrl(session?.user)}
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 relative"
                    onClick={() => {
                      navigator.clipboard.writeText(getDisplayUrl(session?.user));
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                  >
                    {copySuccess ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-2 text-sm">
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    asChild
                  >
                    <Link href={getNavigationUrl(session?.user)}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="ml-2 text-sm">View</span>
                    </Link>
                  </Button>
                  {/* Close button - Desktop only */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissProfileLink}
                    className="hidden sm:flex h-8 w-8 rounded-full shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <QuickAction
              icon={Plus}
              label="New Resource"
              description="Share helpful resources and tutorials with the community"
              href="/dashboard/resources/new"
              color="#3b82f6"
            />
            <QuickAction
              icon={FileText}
              label="Write Blog"
              description="Create engaging blog posts to share your knowledge"
              href="/dashboard/blog/new"
              color="#8b5cf6"
            />
            <QuickAction
              icon={BookMarked}
              label="Saved Items"
              description="Access your collection of saved resources and articles"
              href="/dashboard/saved"
              color="#10b981"
            />
            <QuickAction
              icon={Settings}
              label="Settings"
              description="Manage your account preferences and profile settings"
              href="/dashboard/settings"
              color="#f59e0b"
            />
          </div>
        </div>

        {/* Key Metrics Section */}
        <div className="space-y-6">
          <div className="w-full">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Key Metrics</h2>
                    <p className="text-sm text-muted-foreground">Track your content performance</p>
                  </div>
                </div>

                <div className="flex items-center bg-white dark:bg-card/40 rounded-full p-1 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06)]">
                  <button
                    onClick={() => setContentType('resources')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors flex-1 justify-center sm:flex-initial sm:justify-start",
                      contentType === 'resources' 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FolderOpenDot className="h-4 w-4" />
                    Resources
                  </button>
                  <button
                    onClick={() => setContentType('blog')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors flex-1 justify-center sm:flex-initial sm:justify-start",
                      contentType === 'blog' 
                        ? "bg-primary text-primary-foreground font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Blog Posts
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              {contentType === 'resources' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    icon={FileText}
                    label="Total Resources"
                    value={stats.totalResources.value}
                    trend={stats.totalResources.trend}
                    loading={loading}
                    color="#3b82f6"
                  />
                  <MetricCard
                    icon={Heart}
                    label="Total Likes"
                    value={stats.totalLikes.value}
                    trend={stats.totalLikes.trend}
                    loading={loading}
                    color="#ec4899"
                  />
                  <MetricCard
                    icon={Bookmark}
                    label="Saved Resources"
                    value={stats.savedResources.value}
                    trend={stats.savedResources.trend}
                    loading={loading}
                    color="#10b981"
                  />
                  <MetricCard
                    icon={Calendar}
                    label="This Month"
                    value={stats.monthlyResources.value}
                    trend={stats.monthlyResources.trend}
                    loading={loading}
                    color="#8b5cf6"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    icon={FileText}
                    label="Total Posts"
                    value={stats.totalPosts.value}
                    trend={stats.totalPosts.trend}
                    loading={loading}
                    color="#3b82f6"
                  />
                  <MetricCard
                    icon={Eye}
                    label="Total Views"
                    value={stats.postViews.value}
                    trend={stats.postViews.trend}
                    loading={loading}
                    color="#f59e0b"
                  />
                  <MetricCard
                    icon={ArrowUp}
                    label="Total Votes"
                    value={stats.postVotes.value}
                    trend={stats.postVotes.trend}
                    loading={loading}
                    color="#10b981"
                  />
                  <MetricCard
                    icon={CalendarDays}
                    label="This Month"
                    value={stats.monthlyPosts.value}
                    trend={stats.monthlyPosts.trend}
                    loading={loading}
                    color="#8b5cf6"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Overview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Content Overview</h2>
                <p className="text-sm text-muted-foreground">Manage your posts and resources</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="w-[400px] py-3 text-xs uppercase tracking-wider text-foreground/70">Content</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider text-foreground/70">Status</TableHead>
                  <TableHead className="text-center py-3 text-xs uppercase tracking-wider text-foreground/70">Views/Likes</TableHead>
                  <TableHead className="text-center py-3 text-xs uppercase tracking-wider text-foreground/70">Saves</TableHead>
                  <TableHead className="text-center py-3 text-xs uppercase tracking-wider text-foreground/70">Comments</TableHead>
                  <TableHead className="text-center py-3 text-xs uppercase tracking-wider text-foreground/70">Votes</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider text-foreground/70">Uploaded</TableHead>
                  <TableHead className="text-right py-3 text-xs uppercase tracking-wider text-foreground/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-0">
                      <TableCell className="py-3">
                        <div className="flex items-start gap-2.5">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-3 w-[180px]" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Skeleton className="h-7 w-7" />
                          <Skeleton className="h-7 w-7" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  contentItems
                    .filter(item => {
                      const matchesType = contentFilter === 'all' || item.type === contentFilter;
                      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
                      return matchesType && matchesStatus;
                    })
                    .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                    .map((item) => (
                      <TableRow 
                        key={item.id}
                        className="border-0 hover:bg-muted/40 transition-colors"
                      >
                        <TableCell className="py-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              item.type === 'post' 
                                ? 'bg-purple-500/10' 
                                : 'bg-blue-500/10'
                            }`}>
                              {item.type === 'post' ? (
                                <FileText className="h-3.5 w-3.5 text-purple-500" />
                              ) : (
                                <FolderOpenDot className="h-3.5 w-3.5 text-blue-500" />
                              )}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div>
                                <p className="font-medium text-sm text-foreground/90 leading-snug truncate">
                                  {item.title}
                                </p>
                                <p className="text-xs text-muted-foreground/80 line-clamp-1 leading-normal mt-0.5">
                                  {item.summary}
                                </p>
                              </div>
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.slice(0, 3).map(tag => (
                                    <Badge 
                                      key={tag} 
                                      className={`px-1.5 py-0 text-[10px] font-medium rounded-full shadow-none pointer-events-none ${
                                        item.type === 'post'
                                          ? 'bg-purple-500/5 text-purple-500'
                                          : 'bg-blue-500/5 text-blue-500'
                                      }`}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {item.tags.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      +{item.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.status === 'live' ? 'default' : 'secondary'}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium shadow-none pointer-events-none ${
                              item.status === 'live' 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {item.status === 'live' ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.type === 'post' ? (
                              <>
                                <Eye className="h-3.5 w-3.5 text-foreground/70" />
                                <span className="text-xs font-medium text-foreground">{item.views || 0}</span>
                              </>
                            ) : (
                              <>
                                <Heart className="h-3.5 w-3.5 text-foreground/70" />
                                <span className="text-xs font-medium text-foreground">{item.likes || 0}</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Bookmark className="h-3.5 w-3.5 text-foreground/70" />
                            <span className="text-xs font-medium text-foreground">{item.saves || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.type === 'post' && (
                            <div className="flex items-center justify-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-foreground/70" />
                              <span className="text-xs font-medium text-foreground">{item.comments || 0}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.type === 'post' && (
                            <div className="flex items-center justify-center gap-1.5">
                              <ArrowUp className="h-3.5 w-3.5 text-foreground/70" />
                              <span className="text-xs font-medium text-foreground">{item.votes || 0}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <time className="text-xs text-foreground/70" dateTime={item.uploadedAt}>
                            {formatDate(item.uploadedAt)}
                          </time>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === 'draft' ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7"
                                      onClick={() => handleEdit(item.id, item.type, item.slug)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit {item.type}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <>
                                {item.type === 'post' && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7"
                                          onClick={() => handleView(item.id, item.type, item.slug)}
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                          <span className="sr-only">View</span>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View post</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7"
                                        onClick={() => handleEdit(item.id, item.type, item.slug)}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit {item.type}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                            <AlertDialog>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 text-red-500 hover:text-red-600"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                  </TooltipTrigger>
                                </Tooltip>
                              </TooltipProvider>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {item.type}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this {item.type}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDelete(item.id, item.type, item.slug)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {!loading && (
              <div className="flex items-center justify-between px-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min((page - 1) * itemsPerPage + 1, contentItems.length)} to{' '}
                  {Math.min(page * itemsPerPage, contentItems.length)} of {contentItems.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * itemsPerPage >= contentItems.length}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}