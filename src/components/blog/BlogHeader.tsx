"use client"

import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { 
  User, 
  Settings, 
  BookMarked, 
  History, 
  HelpCircle, 
  Plus, 
  Search, 
  X, 
  Menu, 
  LayoutDashboard, 
  Home,
  FileText,
  FolderOpenDot,
  ExternalLink,
  Copy,
  LogOut,
  CheckCheck
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import MobileNav from "./MobileNav"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ThemeToggle } from "../theme-toggle"
import { Separator } from "@/components/ui/separator"
import type { LucideIcon } from 'lucide-react'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

interface BlogHeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  view?: "grid" | "list";
  onViewChange?: (mode: "grid" | "list") => void;
  totalPosts?: number;
  className?: string;
}

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  href: string;
}

const MenuItem = ({ icon: Icon, label, description, href }: MenuItemProps) => (
  <Link href={href}>
    <DropdownMenuItem className="gap-2 cursor-pointer py-2">
      <Icon className="h-4 w-4" />
      <div className="flex flex-col">
        <span>{label}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
    </DropdownMenuItem>
  </Link>
);

// BlogSearchBar Component
function BlogSearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(JSON.parse(localStorage.getItem("recentBlogSearches") || "[]"))
  }, [])

  const addToRecentSearches = (search: string) => {
    if (!search.trim()) return
    const newSearches = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5)
    localStorage.setItem("recentBlogSearches", JSON.stringify(newSearches))
    setRecentSearches(newSearches)
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    addToRecentSearches(searchQuery)
    setOpen(false)
    router.push(`/blog/search?q=${encodeURIComponent(searchQuery)}`)
  }

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full max-w-2xl justify-start text-muted-foreground hover:text-foreground text-xs sm:text-sm"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5 mr-1 sm:mr-2" />
        <span className="inline-flex truncate">Search...</span>
        <kbd className="absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogTitle className="sr-only">Search Articles</DialogTitle>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="border-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(query)
                }
              }}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {loading && (
              <div className="py-4 text-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto" />
              </div>
            )}

            {!loading && query.length > 0 && results.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;{query}&quot;
                </p>
                <Button variant="link" size="sm" className="mt-1" onClick={() => handleSearch(query)}>
                  View all results
                </Button>
              </div>
            )}

            {!loading && query.length === 0 && recentSearches.length > 0 && (
              <div role="group" aria-labelledby="group-recent">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground" id="group-recent">
                  RECENT SEARCHES
                </div>
                {recentSearches.map((search) => (
                  <div
                    key={search}
                    role="option"
                    className="flex cursor-pointer items-center px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleSearch(search)}
                  >
                    <History className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{search}</span>
                  </div>
                ))}
              </div>
            )}

            {!loading && query.length === 0 && recentSearches.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">Type to search articles...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function BlogHeader({
  searchTerm = "",
  onSearchChange = () => {},
  className
}: BlogHeaderProps) {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const [copied, setCopied] = useState(false)

  const getProfileUrl = () => {
    const identifier = session?.user?.username || session?.user?.email?.split('@')?.[0] || '';
    return `/u/${identifier}`;
  };

  const copyProfileUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const profileUrl = `${window.location.origin}${getProfileUrl()}`;
      navigator.clipboard.writeText(profileUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy: ", err);
        });
    } catch (error) {
      console.error("Copy operation failed: ", error);
    }
  };

  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden">
      <div className="flex items-center justify-between h-11 px-2 gap-1 max-w-full">
        {/* Logo Section - More compact */}
        <div className="flex items-center gap-1 min-w-fit">
          <MobileNav />
          <Link href="/" className="font-semibold text-sm whitespace-nowrap flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>Byteinit</span>
          </Link>
          <Link href="/blog" className="text-xs text-muted-foreground ml-1 hidden sm:block">
            <span>Blog</span>
          </Link>
          <Link href="/resources" className="text-xs text-muted-foreground ml-1 hidden sm:block">
            <span>Resources</span>
          </Link>
        </div>

        {/* Search - Make it more adaptive */}
        <div className="flex-1 max-w-[45%] sm:max-w-md mx-auto px-1">
          <BlogSearchBar />
        </div>

        {/* Actions - More compact */}
        <div className="flex items-center gap-1 ml-1">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {isLoggedIn ? (
            <>
              {/* Create Button with Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      className="h-7 w-7 rounded-full p-0 flex items-center justify-center"
                      asChild
                    >
                      <Link href="/blog/editor">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="sr-only">Create post</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create Post</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full flex items-center justify-center"
                  >
                    <Avatar className="h-6 w-6 border border-border">
                      {session.user?.image ? (
                        <AvatarImage src={session.user.image} alt={session.user?.name || 'Profile'} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-border">
                        {session.user?.image ? (
                          <AvatarImage src={session.user.image} alt={session.user?.name || 'Profile'} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-none">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <MenuItem 
                      icon={LayoutDashboard} 
                      label="Dashboard" 
                      href="/dashboard" 
                    />
                    {/* Public Profile with Copy Button */}
                    <div className="relative">
                      <Link href={getProfileUrl()}>
                        <DropdownMenuItem className="gap-2 cursor-pointer py-2 pr-10">
                          <ExternalLink className="h-4 w-4" />
                          <span>Public Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={copyProfileUrl}
                      >
                        {copied ? 
                          <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : 
                          <Copy className="h-3.5 w-3.5 opacity-70" />
                        }
                      </Button>
                    </div>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <MenuItem 
                      icon={FileText} 
                      label="My Articles" 
                      href="/dashboard/blog" 
                    />
                    <MenuItem 
                      icon={FolderOpenDot} 
                      label="My Resources" 
                      href="/dashboard/resources" 
                    />
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <MenuItem 
                      icon={BookMarked} 
                      label="Saved Articles" 
                      href="/blog/bookmarks" 
                    />
                    <MenuItem 
                      icon={History} 
                      label="Reading History" 
                      href="/blog/history" 
                    />
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    <MenuItem 
                      icon={Settings} 
                      label="Settings" 
                      href="/profile" 
                    />
                    <MenuItem 
                      icon={HelpCircle} 
                      label="Help Center" 
                      href="/help" 
                    />
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="gap-2 text-red-600 cursor-pointer focus:text-red-600 py-2"
                    onClick={() => {
                      window.location.href = '/api/auth/signout';
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                asChild
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button 
                size="sm"
                className="h-7 px-2 text-xs whitespace-nowrap"
                asChild
              >
                <Link href="/auth/register">
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Add default export
export default BlogHeader;