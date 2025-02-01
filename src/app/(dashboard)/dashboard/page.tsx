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

// Define the data type for the table
type Resource = {
  id: string
  title: string
  category: string
  type: string
  likes: number
  createdAt: string
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
  // Use a state variable for the selected time range (7 days, 30 days, 6 months = 180 days)
  const [selectedRange, setSelectedRange] = useState<number>(30)

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
        const resourcesResponse = await fetch(`/api/resources?userId=${session?.user?.id}`)
        const allResources = await resourcesResponse.json()
        const userResources = allResources.filter(
          (resource: any) => resource.userId === session?.user?.id,
        )

        const savedResponse = await fetch("/api/saved-resources")
        const savedResources = await savedResponse.json()

        const totalLikes = userResources.reduce(
          (acc: number, resource: any) => acc + (resource.likes || 0),
          0,
        )

        const now = new Date()
        const thisMonth = now.getMonth()
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
        const thisYear = now.getFullYear()
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

        const thisMonthResources = userResources.filter((resource: any) => {
          const createdAt = new Date(resource.createdAt)
          return createdAt.getMonth() === thisMonth && createdAt.getFullYear() === thisYear
        })

        const lastMonthResources = userResources.filter((resource: any) => {
          const createdAt = new Date(resource.createdAt)
          return createdAt.getMonth() === lastMonth && createdAt.getFullYear() === lastMonthYear
        })

        const calculateTrend = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0
          return Math.round(((current - previous) / previous) * 100)
        }

        setStats({
          totalResources: {
            value: userResources.length,
            trend: calculateTrend(thisMonthResources.length, lastMonthResources.length),
          },
          savedResources: {
            value: savedResources.length,
            trend: calculateTrend(
              savedResources.filter((r: any) => new Date(r.createdAt).getMonth() === thisMonth).length,
              savedResources.filter((r: any) => new Date(r.createdAt).getMonth() === lastMonth).length,
            ),
          },
          totalLikes: {
            value: totalLikes,
            trend: calculateTrend(
              thisMonthResources.reduce((acc: number, r: any) => acc + (r.likes || 0), 0),
              lastMonthResources.reduce((acc: number, r: any) => acc + (r.likes || 0), 0),
            ),
          },
          monthlyResources: {
            value: thisMonthResources.length,
            trend: calculateTrend(thisMonthResources.length, lastMonthResources.length),
          },
        })

        setResources(userResources)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to fetch dashboard data")
      } finally {
        setTimeout(() => setLoading(false), 300)
      }
    }

    if (session?.user) {
      fetchData()
    }
  }, [session])

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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
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
          Last {selectedRange === 180 ? "6 Months" : `${selectedRange} Days`} activity
        </p>
      </div>
    </div>
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 pl-3 pr-2.5 gap-2 font-normal">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {selectedRange === 180 ? "6 Months" : `${selectedRange} Days`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] p-2">
        <DropdownMenuItem 
          onClick={() => setSelectedRange(7)}
          className="rounded-sm px-3 py-2 text-sm gap-3"
        >
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span>Last 7 Days</span>
          {selectedRange === 7 && <Check className="h-4 w-4 ml-auto text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setSelectedRange(30)}
          className="rounded-sm px-3 py-2 text-sm gap-3"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Last 30 Days</span>
          {selectedRange === 30 && <Check className="h-4 w-4 ml-auto text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setSelectedRange(180)}
          className="rounded-sm px-3 py-2 text-sm gap-3"
        >
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <span>Last 6 Months</span>
          {selectedRange === 180 && <Check className="h-4 w-4 ml-auto text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <Card className="p-6 rounded-xl border bg-background shadow-sm">
    <ChartContainer config={chartConfig} className="w-full h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="savesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={formatDate}
            padding={{ left: 16, right: 16 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            width={40}
          />

          <ChartTooltip 
            content={({ active, payload }) => (
              <ChartTooltipContent 
                active={active}
                payload={payload}
                className="rounded-lg border bg-background px-3 py-2 shadow-sm"
                labelClassName="text-sm font-medium text-muted-foreground"
              />
            )}
          />

          <Area
            type="monotone"
            dataKey="likes"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#likesGradient)"
          />

          <Area
            type="monotone"
            dataKey="saves"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#savesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
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
