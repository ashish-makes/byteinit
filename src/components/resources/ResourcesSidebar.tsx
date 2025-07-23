"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Tag, 
  Grid, 
  Bookmark, 
  TrendingUp,
  Plus,
  Home,
  Code2,
  Globe,
  Brain,
  Cpu,
  Smartphone,
  Cloud,
  Shield,
  Database,
  Settings,
  HelpCircle
} from "lucide-react"

// Resource categories and types from your schema
const RESOURCE_CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "FRONTEND", label: "Frontend" },
  { id: "BACKEND", label: "Backend" },
  { id: "FULLSTACK", label: "Fullstack" },
  { id: "DEVOPS", label: "DevOps" },
  { id: "MOBILE", label: "Mobile" },
  { id: "AI_ML", label: "AI & ML" },
  { id: "DATABASE", label: "Database" },
  { id: "SECURITY", label: "Security" },
  { id: "UI_UX", label: "UI/UX" },
  { id: "DESIGN", label: "Design" },
  { id: "CLOUD", label: "Cloud" },
  { id: "OTHER", label: "Other" }
]

const RESOURCE_TYPES = [
  { id: "ALL", label: "All Types" },
  { id: "LIBRARY", label: "Libraries" },
  { id: "TOOL", label: "Tools" },
  { id: "FRAMEWORK", label: "Frameworks" },
  { id: "TUTORIAL", label: "Tutorials" },
  { id: "TEMPLATE", label: "Templates" },
  { id: "ICON_SET", label: "Icon Sets" },
  { id: "ILLUSTRATION", label: "Illustrations" },
  { id: "COMPONENT_LIBRARY", label: "Component Libraries" },
  { id: "CODE_SNIPPET", label: "Code Snippets" },
  { id: "API", label: "APIs" },
  { id: "DOCUMENTATION", label: "Documentation" },
  { id: "COURSE", label: "Courses" },
  { id: "OTHER", label: "Other" }
]

// Popular tags (these would ideally come from your API)
const POPULAR_TAGS = [
  "react", "nextjs", "typescript", "javascript", "tailwind", 
  "node", "python", "aws", "docker", "kubernetes"
]

interface NavItem {
  readonly icon: React.ElementType;
  readonly label: string;
  readonly href: string;
}

interface ResourcesSidebarProps {
  onCategorySelect?: (category: string) => void;
  onTypeSelect?: (type: string) => void;
  onTagSelect?: (tag: string) => void;
  selectedCategory?: string;
  selectedType?: string;
  selectedTag?: string;
  className?: string;
}

export function ResourcesSidebar({
  onCategorySelect,
  onTypeSelect,
  onTagSelect,
  selectedCategory = "ALL",
  selectedType = "ALL",
  selectedTag,
  className
}: ResourcesSidebarProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState({
    categories: true,
    types: true,
    tags: true,
    topics: true,
    help: true
  })
  
  const mainNav: NavItem[] = [
    { icon: Home, label: 'Home', href: '/resources' },
  ]

  const discoverNav: NavItem[] = [
    { icon: TrendingUp, label: 'Trending', href: '/resources/trending' },
    { icon: Bookmark, label: 'Bookmarks', href: '/resources/bookmarks' },
  ]
  
  const topicsNav: NavItem[] = [
    { icon: Code2, label: 'Programming', href: '/resources/programming' },
    { icon: Globe, label: 'Web Development', href: '/resources/web-development' },
    { icon: Brain, label: 'Machine Learning', href: '/resources/machine-learning' },
    { icon: Cpu, label: 'AI', href: '/resources/artificial-intelligence' },
    { icon: Smartphone, label: 'Mobile Dev', href: '/resources/mobile-development' },
    { icon: Cloud, label: 'Cloud', href: '/resources/cloud-computing' },
    { icon: Shield, label: 'Security', href: '/resources/security' },
    { icon: Database, label: 'Databases', href: '/resources/databases' },
  ]
  
  const helpNav: NavItem[] = [
    { icon: HelpCircle, label: 'Help Center', href: '/help' },
    { icon: Settings, label: 'Settings', href: '/dashboard/profile' },
  ]

  const NavItem = ({ item }: { item: NavItem }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        pathname === item.href && "bg-accent"
      )}
      asChild
    >
      <Link href={item.href} className="flex items-center">
        <item.icon className="mr-2 h-4 w-4" />
        <span className="truncate">{item.label}</span>
      </Link>
    </Button>
  )

  const NavSection = ({ title, items }: { title: string; items: readonly NavItem[] | NavItem[] }) => (
    <div className="space-y-1">
      <h2 className="px-2 text-xs font-semibold tracking-wide text-muted-foreground">
        {title}
      </h2>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.href} item={item as NavItem} />
        ))}
      </nav>
    </div>
  )

  return (
    <ScrollArea className="h-full">
      <div className="px-2 py-3">
        <div className="flex items-center justify-between px-2 mb-4">
          <h2 className="font-semibold text-lg">Resources</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/resources/new" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Submit</span>
            </Link>
          </Button>
        </div>
        
        <div className="space-y-4">
          <NavSection title="HOME" items={mainNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="DISCOVER" items={discoverNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <div className="space-y-1">
            <h2 className="px-2 text-xs font-semibold tracking-wide text-muted-foreground">
              CATEGORIES
            </h2>
            <nav className="space-y-1">
              {RESOURCE_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    selectedCategory === category.id && "bg-accent font-medium"
                  )}
                  onClick={() => onCategorySelect?.(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </nav>
          </div>
          
          <Separator className="mx-1 opacity-50" />
          
          <div className="space-y-1">
            <h2 className="px-2 text-xs font-semibold tracking-wide text-muted-foreground">
              TYPES
            </h2>
            <nav className="space-y-1">
              {RESOURCE_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    selectedType === type.id && "bg-accent font-medium"
                  )}
                  onClick={() => onTypeSelect?.(type.id)}
                >
                  {type.label}
                </Button>
              ))}
            </nav>
          </div>
          
          <Separator className="mx-1 opacity-50" />
          
          <div className="space-y-1">
            <h2 className="px-2 text-xs font-semibold tracking-wide text-muted-foreground">
              POPULAR TAGS
            </h2>
            <div className="flex flex-wrap gap-2 p-2">
              {POPULAR_TAGS.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs h-7",
                    selectedTag === tag && "bg-primary/10 border-primary text-primary"
                  )}
                  onClick={() => onTagSelect?.(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="TOPICS" items={topicsNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="HELP & SETTINGS" items={helpNav} />
        </div>

        <div className="h-6" />
      </div>
    </ScrollArea>
  )
} 