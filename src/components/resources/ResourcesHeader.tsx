"use client"

import { useState, useEffect } from "react"
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { User, Settings, BookMarked, History, HelpCircle, Plus, Search, X, Menu } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import ResourcesMobileNav from "./ResourcesMobileNav"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface ResourcesHeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  totalResources?: number;
  className?: string;
}

// ResourcesSearchBar component to match BlogHeader's SearchBar
function ResourcesSearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(JSON.parse(localStorage.getItem("recentResourceSearches") || "[]"))
  }, [])

  const addToRecentSearches = (search: string) => {
    if (!search.trim()) return
    const newSearches = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5)
    localStorage.setItem("recentResourceSearches", JSON.stringify(newSearches))
    setRecentSearches(newSearches)
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    addToRecentSearches(searchQuery)
    setOpen(false)
    router.push(`/resources/search?q=${encodeURIComponent(searchQuery)}`)
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
        className="relative h-9 w-full max-w-2xl justify-start text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5 mr-2" />
        <span className="inline-flex truncate text-sm">Search resources...</span>
        <kbd className="absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogTitle className="sr-only">Search Resources</DialogTitle>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
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
                <p className="text-sm text-muted-foreground">Type to search resources...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ResourcesHeader({
  searchTerm = "",
  onSearchChange = () => {},
  className
}: ResourcesHeaderProps) {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-11 px-2 gap-2">
        {/* Logo Section - More compact */}
        <div className="flex items-center gap-1.5 min-w-fit">
          <ResourcesMobileNav />
          <Link href="/resources" className="font-semibold text-sm whitespace-nowrap">
            Byteinit
          </Link>
        </div>

        {/* Search - Using ResourcesSearchBar component */}
        <div className="flex-1 max-w-md mx-auto px-1">
          <ResourcesSearchBar />
        </div>

        {/* Actions - More compact */}
        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {/* Mobile Add Resource Button */}
              <Button
                variant="default"
                size="icon"
                className="h-7 w-7 rounded-full sm:hidden"
                asChild
              >
                <Link href="/resources/submit">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="sr-only">Submit resource</span>
                </Link>
              </Button>

              {/* Desktop Add Resource Button */}
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 hidden sm:flex h-7 text-xs"
                asChild
              >
                <Link href="/resources/submit">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Resource</span>
                </Link>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full"
                  >
                    <Avatar className="h-7 w-7 cursor-pointer hover:opacity-80 transition">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback>
                        {session.user.name?.[0] || <User className="h-3.5 w-3.5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 mt-1">
                  <DropdownMenuLabel className="flex items-center gap-2 p-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-medium leading-none truncate">
                        {session?.user.name}
                      </p>
                      <p className="text-[10px] leading-none text-muted-foreground truncate">
                        {session?.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center text-xs">
                      <User className="mr-2 h-3.5 w-3.5" />
                      Your Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resources/bookmarks" className="flex items-center text-xs">
                      <BookMarked className="mr-2 h-3.5 w-3.5" />
                      Saved Resources
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resources/history" className="flex items-center text-xs">
                      <History className="mr-2 h-3.5 w-3.5" />
                      History
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center text-xs">
                      <Settings className="mr-2 h-3.5 w-3.5" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center text-xs">
                      <HelpCircle className="mr-2 h-3.5 w-3.5" />
                      Help Center
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="text-red-500 text-xs">
                    <Link href="/api/auth/signout" className="w-full">
                      Sign Out
                    </Link>
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