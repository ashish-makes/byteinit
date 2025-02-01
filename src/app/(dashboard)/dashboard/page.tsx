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

// Import Recharts components for AreaChart
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
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
}[]

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')
  const [stats, setStats] = useState({
    totalResources: { value: 0, trend: 0 },
    savedResources: { value: 0, trend: 0 },
    totalLikes: { value: 0, trend: 0 },
    monthlyResources: { value: 0, trend: 0 },
  })
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<"asc" | "desc" | null>(null)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData>([])

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
        const todayLikes = userResources.reduce((acc: number, r: Resource) => {
          if (isInDay(new Date(r.createdAt), today)) {
            return acc + (r.likes || 0)
          }
          return acc
        }, 0)

        const yesterdayLikes = userResources.reduce((acc: number, r: Resource) => {
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
            trend: calculateTrend(todayLikes, yesterdayLikes),
          },
          monthlyResources: {
            value: todayResources.length,
            trend: calculateTrend(todayResources.length, yesterdayResources.length),
          },
        })

        setResources(userResources)

        // Fetch chart data
        const chartDataResponse = await fetch(
          `/api/resources/chart-data?userId=${session?.user?.id}&range=${selectedRange}`
        )
        const chartData = await chartDataResponse.json()
        setChartData(chartData)

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

  // Fetch chart data whenever the selectedRange changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const chartDataResponse = await fetch(
          `/api/resources/chart-data?userId=${session?.user?.id}&range=${selectedRange}`,
        )
        const data = await chartDataResponse.json()
        setChartData(data)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        toast.error("Failed to fetch chart data")
      }
    }

    if (session?.user) {
      fetchChartData()
    }
  }, [session, selectedRange])

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

  // A helper function for formatting dates on the X-axis
  const formatDate = (value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-foreground/90">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name || "User"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Your Resources Card */}
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
          <div className="p-2 rounded-md bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-foreground/90">
                {loading ? <Skeleton className="h-7 w-12 rounded" /> : stats.totalResources.value}
              </p>
              {!loading && stats.totalResources.trend !== 0 && (
                <div className={`flex items-center gap-1 ${stats.totalResources.trend > 0 ? "text-green-500" : "text-red-500"} text-sm`}>
                  {stats.totalResources.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(stats.totalResources.trend)}%</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Your Resources</p>
          </div>
        </div>

        {/* Saved Resources Card */}
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
          <div className="p-2 rounded-md bg-primary/10">
            <Bookmark className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-foreground/90">
                {loading ? <Skeleton className="h-7 w-12 rounded" /> : stats.savedResources.value}
              </p>
              {!loading && stats.savedResources.trend !== 0 && (
                <div className={`flex items-center gap-1 ${stats.savedResources.trend > 0 ? "text-green-500" : "text-red-500"} text-sm`}>
                  {stats.savedResources.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(stats.savedResources.trend)}%</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Saved Resources</p>
          </div>
        </div>

        {/* Likes on Your Resources Card */}
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
          <div className="p-2 rounded-md bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-foreground/90">
                {loading ? <Skeleton className="h-7 w-12 rounded" /> : stats.totalLikes.value}
              </p>
              {!loading && stats.totalLikes.trend !== 0 && (
                <div className={`flex items-center gap-1 ${stats.totalLikes.trend > 0 ? "text-green-500" : "text-red-500"} text-sm`}>
                  {stats.totalLikes.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(stats.totalLikes.trend)}%</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Likes on Your Resources</p>
          </div>
        </div>

        {/* Resources This Month Card */}
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background/80 backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
          <div className="p-2 rounded-md bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-foreground/90">
                {loading ? <Skeleton className="h-7 w-12 rounded" /> : stats.monthlyResources.value}
              </p>
              {!loading && stats.monthlyResources.trend !== 0 && (
                <div className={`flex items-center gap-1 ${stats.monthlyResources.trend > 0 ? "text-green-500" : "text-red-500"} text-sm`}>
                  {stats.monthlyResources.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(stats.monthlyResources.trend)}%</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Resources This Month</p>
          </div>
        </div>
      </div>

{/* Chart Section */}
<div className="space-y-4">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Activity className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Engagement Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Last {selectedRange === 'today' ? 'Today' :
           selectedRange === '7d' ? 'Last 7 Days' :
           selectedRange === '30d' ? 'Last 30 Days' :
           selectedRange === '3m' ? 'Last 3 Months' :
           selectedRange === '6m' ? 'Last 6 Months' :
           selectedRange === '1y' ? 'Last Year' : 'Lifetime'} activity
        </p>
      </div>
    </div>
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 px-4 gap-2">
          <CalendarDays className="h-4 w-4" />
          <span>
            {selectedRange === 'today' ? 'Today' :
             selectedRange === '7d' ? 'Last 7 Days' :
             selectedRange === '30d' ? 'Last 30 Days' :
             selectedRange === '3m' ? 'Last 3 Months' :
             selectedRange === '6m' ? 'Last 6 Months' :
             selectedRange === '1y' ? 'Last Year' : 'Lifetime'}
          </span>
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

  <Card className="p-6 rounded-xl border bg-card">
    <div className="space-y-8">
      <div className="flex flex-wrap gap-8 items-center justify-center sm:justify-start">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-sm">Daily Likes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm">Daily Saves</span>
        </div>
      </div>

      <div className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={formatDate}
              padding={{ left: 20, right: 20 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString()}
              width={40}
            />

            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                
                const date = new Date(payload[0]?.payload?.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div className="rounded-lg border bg-card px-4 py-3 shadow-md">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {formattedDate}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">{payload[0]?.value}</span>
                        <span className="text-xs text-muted-foreground">likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">{payload[1]?.value}</span>
                        <span className="text-xs text-muted-foreground">saves</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="likes"
              stroke="rgb(59, 130, 246)"
              strokeWidth={2}
              fill="url(#likesGradient)"
              dot={false}
            />

            <Area
              type="monotone"
              dataKey="saves"
              stroke="rgb(16, 185, 129)"
              strokeWidth={2}
              fill="url(#savesGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </Card>
</div>

      {/* Resource Table */}
      <div className="space-y-4">
      <div className="flex items-center gap-3">
  <div className="p-2 rounded-lg bg-primary/10">
    <FolderOpenDot className="h-5 w-5 text-primary" />
  </div>
  <div>
    <h2 className="text-lg font-semibold text-foreground">Your Resources</h2>
    <p className="text-sm text-muted-foreground">
      {resources.length} resources • Sorted by {sorting || 'recent'}
    </p>
  </div>
</div>
        <div className="overflow-x-auto">
          <Table className="min-w-full rounded-lg border border-border bg-background/80 backdrop-blur-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">
                  <Button variant="ghost" onClick={() => handleSort("title")} className="p-0 hover:bg-transparent">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort("category")} className="p-0 hover:bg-transparent">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Button variant="ghost" onClick={() => handleSort("type")} className="p-0 hover:bg-transparent">
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <Button variant="ghost" onClick={() => handleSort("likes")} className="p-0 hover:bg-transparent">
                    Likes
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <Button variant="ghost" onClick={() => handleSort("saves")} className="p-0 hover:bg-transparent">
                    Saves
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button variant="ghost" onClick={() => handleSort("createdAt")} className="p-0 hover:bg-transparent">
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                : resources.map((resource) => (
                    <TableRow key={resource.id} className="hover:bg-accent/5">
                      <TableCell>
                        <Link href={`/dashboard/resources/${resource.id}`} className="font-medium hover:underline">
                          {resource.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.type}</Badge>
                      </TableCell>
                      <TableCell>{resource.likes}</TableCell>
                      <TableCell>{resource.saves}</TableCell>
                      <TableCell>{new Date(resource.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(resource.id)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(resource.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your resource and remove it from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
