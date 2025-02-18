/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
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

// Import Recharts components for AreaChart
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
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

// Add after imports
type TimeRange = 'today' | '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

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

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')
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

  // Fetch stats and resources when session loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's resources
        const resourcesResponse = await fetch(`/api/resources?userId=${session?.user?.id}`)
        const allResources = await resourcesResponse.json()
        const userResources = allResources.filter(
          (resource: Resource) => resource.userId === session?.user?.id,
        )

        // Fetch saved resources stats
        const savedResponse = await fetch("/api/saved-resources/stats")
        const savesData = await savedResponse.json()
        
        // Fetch blog stats
        const blogResponse = await fetch(`/api/blog/stats?userId=${session?.user?.id}`)
        const blogStats = await blogResponse.json()
        
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
            value: blogStats.totalPosts,
            trend: calculateTrend(blogStats.todayPosts, blogStats.yesterdayPosts),
          },
          postViews: {
            value: blogStats.totalViews,
            trend: calculateTrend(blogStats.todayViews, blogStats.yesterdayViews),
          },
          postVotes: {
            value: blogStats.totalVotes,
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
      if (a[column] < b[column]) return newSorting === "asc" ? -1 : 1
      if (a[column] > b[column]) return newSorting === "asc" ? 1 : -1
      return 0
    })

    setResources(sorted)
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/resources/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    setResourceToDelete(id)
  }

  const confirmDelete = async () => {
    if (!resourceToDelete) return

    toast.promise(
      fetch(`/api/resources/${resourceToDelete}`, { method: "DELETE" }).then((response) => {
        if (response.ok) {
          setResources(resources.filter((resource) => resource.id !== resourceToDelete))
          return "Resource deleted successfully"
        } else {
          throw new Error("Failed to delete resource")
        }
      }),
      {
        loading: "Deleting resource...",
        success: "Resource deleted successfully",
        error: "Failed to delete resource",
      },
    )

    setResourceToDelete(null)
  }

  // Update the formatDate helper function
  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      timeZone: getUserTimeZone(),
      month: 'short',
      day: 'numeric'
    });
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
                "React Best Practices" received 45% more engagement this week
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-8">
        {/* Welcome and Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground/90">Welcome back, {session?.user?.name || "User"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your content
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/new">
              <FileText className="h-4 w-4" />
              Create New Post
            </Link>
          </Button>
        </div>

        {/* Profile Link Card - Only show if not dismissed */}
        <AnimatePresence mode="wait">
          {showProfileLink && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border bg-card/50 backdrop-blur-sm"
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

              <div className="flex items-center gap-3 flex-1 min-w-0 pr-8 sm:pr-0">
                <div className="p-2 rounded-md bg-primary/10 shrink-0">
                  <Link2 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm text-foreground/90 flex items-center gap-2">
                    Your Profile is Ready! 
                    <span className="hidden xs:inline">🎉</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-0.5 text-xs rounded bg-muted truncate">
                      {getDisplayUrl(session?.user)}
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:w-auto sm:px-3 relative"
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
                      <Check className="h-3 w-3" />
                    </motion.div>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline-block sm:ml-1 text-xs">
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 sm:w-auto sm:px-3"
                  asChild
                >
                  <Link href={getNavigationUrl(session?.user)}>
                    <ExternalLink className="h-3 w-3" />
                    <span className="hidden sm:inline-block sm:ml-1 text-xs">View</span>
                  </Link>
                </Button>
                {/* Close button - Desktop only */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissProfileLink}
                  className="hidden sm:flex h-8 w-8 rounded-full shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Resources */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
            <div>
              <h2 className="text-lg font-semibold">Resources Overview</h2>
              <p className="text-sm text-muted-foreground">Your resource metrics</p>
                </div>
            </div>

          {/* Resource Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={FileText}
              label="Total Resources"
              value={stats.totalResources.value}
              trend={stats.totalResources.trend}
              loading={loading}
            />
            <StatCard
              icon={Heart}
              label="Total Likes"
              value={stats.totalLikes.value}
              trend={stats.totalLikes.trend}
              loading={loading}
            />
            <StatCard
              icon={Bookmark}
              label="Saved Resources"
              value={stats.savedResources.value}
              trend={stats.savedResources.trend}
              loading={loading}
            />
            <StatCard
              icon={Calendar}
              label="This Month"
              value={stats.monthlyResources.value}
              trend={stats.monthlyResources.trend}
              loading={loading}
            />
          </div>

          {/* Resource Performance Chart */}
          <Card className="p-4">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Performance</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedRange === 'today' ? 'Today' :
                       selectedRange === '7d' ? 'Last 7 Days' :
                       selectedRange === '30d' ? 'Last 30 Days' :
                       selectedRange === '3m' ? 'Last 3 Months' :
                       selectedRange === '6m' ? 'Last 6 Months' :
                       selectedRange === '1y' ? 'Last Year' : 'Lifetime'} overview
                    </p>
                  </div>
                </div>
                
                {/* Time Range Selector - Better positioned */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {selectedRange === 'today' ? 'Today' :
                       selectedRange === '7d' ? '7 Days' :
                       selectedRange === '30d' ? '30 Days' :
                       selectedRange === '3m' ? '3 Months' :
                       selectedRange === '6m' ? '6 Months' :
                       selectedRange === '1y' ? '1 Year' : 'All Time'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    {[
                      { value: 'today', label: 'Today', icon: Timer },
                      { value: '7d', label: 'Last 7 Days', icon: Calendar },
                      { value: '30d', label: 'Last 30 Days', icon: Calendar },
                      { value: '3m', label: 'Last 3 Months', icon: CalendarRange },
                      { value: '6m', label: 'Last 6 Months', icon: CalendarRange },
                      { value: '1y', label: 'Last Year', icon: CalendarRange },
                      { value: 'all', label: 'Lifetime', icon: CalendarRange },
                    ].map(({ value, label, icon: Icon }) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => setSelectedRange(value as TimeRange)}
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                        {selectedRange === value && <Check className="h-4 w-4 ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
          </div>

              {/* Chart Legend - Moved below header */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
                    <span className="text-sm text-muted-foreground font-medium">Resource Likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 border-2 border-blue-500 rounded-full" />
                    <span className="text-sm text-muted-foreground font-medium">Resource Saves</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
                    <span className="text-sm text-muted-foreground font-medium">Post Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 border-2 border-purple-500 rounded-full" />
                    <span className="text-sm text-muted-foreground font-medium">Post Votes</span>
                  </div>
                </div>
              </div>

              <div className="h-[240px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="resourceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="combinedPostGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="rgb(147, 51, 234)" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={formatDate}
                      padding={{ left: 10, right: 10 }}
                      minTickGap={5}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(value) => value.toLocaleString()}
                      width={35}
                    />

                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload) return null;
                        
                        const date = new Date(label);
                        const formattedDate = date.toLocaleDateString('en-US', {
                          timeZone: getUserTimeZone(),
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        });

                        const resourceEngagement = Number(payload[0]?.value || 0) + Number(payload[1]?.value || 0);
                        const postEngagement = Number(payload[2]?.value || 0) + Number(payload[3]?.value || 0);

                        return (
                          <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              {formattedDate}
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
                                <span className="text-xs font-medium">{resourceEngagement}</span>
                                <span className="text-[10px] text-muted-foreground">resources</span>
                </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400" />
                                <span className="text-xs font-medium">{postEngagement}</span>
                                <span className="text-[10px] text-muted-foreground">posts</span>
            </div>
          </div>
                          </div>
                        );
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="likes"
                      name="Likes"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth={1.5}
                      fill="url(#resourceGradient)"
                      dot={false}
                    />

                    <Area
                      type="monotone"
                      dataKey="saves"
                      name="Saves"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth={1.5}
                      fillOpacity={0}
                      dot={false}
                      strokeDasharray="4 4"
                    />

                    <Area
                      type="monotone"
                      dataKey="postViews"
                      name="Views"
                      stroke="rgb(147, 51, 234)"
                      strokeWidth={1.5}
                      fill="url(#combinedPostGradient)"
                      dot={false}
                    />

                    <Area
                      type="monotone"
                      dataKey="postVotes"
                      name="Votes"
                      stroke="rgb(147, 51, 234)"
                      strokeWidth={1.5}
                      fillOpacity={0}
                      dot={false}
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Blog */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
        <h2 className="text-lg font-semibold">Blog Overview</h2>
              <p className="text-sm text-muted-foreground">Your blog metrics</p>
            </div>
          </div>

          {/* Blog Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            icon={FileText}
            label="Total Posts"
            value={stats.totalPosts.value}
            trend={stats.totalPosts.trend}
            loading={loading}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.postViews.value}
            trend={stats.postViews.trend}
            loading={loading}
          />
          <StatCard
            icon={ArrowUp}
            label="Total Votes"
            value={stats.postVotes.value}
            trend={stats.postVotes.trend}
            loading={loading}
          />
          <StatCard
            icon={CalendarDays}
              label="This Month"
            value={stats.monthlyPosts.value}
            trend={stats.monthlyPosts.trend}
            loading={loading}
          />
      </div>

          {/* Blog Performance Chart */}
          <Card className="p-4">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
                    <h2 className="text-lg font-semibold">Blog Performance</h2>
              <p className="text-sm text-muted-foreground">
                      {selectedRange === 'today' ? 'Today' :
                 selectedRange === '7d' ? 'Last 7 Days' :
                 selectedRange === '30d' ? 'Last 30 Days' :
                 selectedRange === '3m' ? 'Last 3 Months' :
                 selectedRange === '6m' ? 'Last 6 Months' :
                       selectedRange === '1y' ? 'Last Year' : 'Lifetime'} overview
              </p>
            </div>
          </div>
          
                {/* Time Range Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <CalendarDays className="h-4 w-4 mr-2" />
                  {selectedRange === 'today' ? 'Today' :
                       selectedRange === '7d' ? '7 Days' :
                       selectedRange === '30d' ? '30 Days' :
                       selectedRange === '3m' ? '3 Months' :
                       selectedRange === '6m' ? '6 Months' :
                       selectedRange === '1y' ? '1 Year' : 'All Time'}
                      <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              {[
                { value: 'today', label: 'Today', icon: Timer },
                { value: '7d', label: 'Last 7 Days', icon: Calendar },
                { value: '30d', label: 'Last 30 Days', icon: Calendar },
                { value: '3m', label: 'Last 3 Months', icon: CalendarRange },
                { value: '6m', label: 'Last 6 Months', icon: CalendarRange },
                { value: '1y', label: 'Last Year', icon: CalendarRange },
                { value: 'all', label: 'Lifetime', icon: CalendarRange },
              ].map(({ value, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setSelectedRange(value as TimeRange)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {selectedRange === value && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400" />
                    <span className="text-sm text-muted-foreground font-medium">Views</span>
              </div>
              <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 border-2 border-green-500 rounded-full" />
                    <span className="text-sm text-muted-foreground font-medium">Votes</span>
                  </div>
              </div>
            </div>

              <div className="h-[240px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="rgb(249, 115, 22)" stopOpacity={0.01} />
                    </linearGradient>
                      <linearGradient id="votesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    tickFormatter={formatDate}
                      padding={{ left: 10, right: 10 }}
                      minTickGap={5}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    tickFormatter={(value) => value.toLocaleString()}
                      width={35}
                  />

                    <Tooltip
                      content={({ active, payload, label }) => {
                      if (!active || !payload) return null;
                      
                        const date = new Date(label);
                      const formattedDate = date.toLocaleDateString('en-US', {
                          timeZone: getUserTimeZone(),
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                          <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                            {formattedDate}
                          </p>
                            <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400" />
                                <span className="text-xs font-medium">{Number(payload[0]?.value || 0)}</span>
                                <span className="text-[10px] text-muted-foreground">views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-green-400" />
                                <span className="text-xs font-medium">{Number(payload[1]?.value || 0)}</span>
                                <span className="text-[10px] text-muted-foreground">votes</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />

                  <Area
                    type="monotone"
                      dataKey="postViews"
                      name="Views"
                      stroke="rgb(249, 115, 22)"
                      strokeWidth={1.5}
                      fill="url(#viewsGradient)"
                    dot={false}
                  />

                  <Area
                    type="monotone"
                      dataKey="postVotes"
                      name="Votes"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth={1.5}
                      fillOpacity={0}
                    dot={false}
                      strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
              </div>
          </div>
        </Card>
      </div>
    </div>
  </motion.div>
);
}