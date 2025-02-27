/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Search, History, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import TagBadge from "./TagBadge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  slug: string
  tags: string[]
  summary: string | null
}

interface TrendingSearch {
  query: string
  count: number
}

interface PopularTag {
  name: string
  count: number
}

interface SearchItemProps {
  children: React.ReactNode
  onSelect?: () => void
  className?: string
}

function SearchItem({ children, onSelect, className }: SearchItemProps) {
  return (
    <div
      role="option"
      className={cn(
        "flex cursor-pointer items-center px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onSelect}
    >
      {children}
    </div>
  )
}

function SearchGroup({ children, heading }: { children: React.ReactNode; heading: string }) {
  return (
    <div role="group" aria-labelledby={`group-${heading}`}>
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground" id={`group-${heading}`}>
        {heading}
      </div>
      {children}
    </div>
  )
}

function SearchSeparator() {
  return (
    <div className="mx-1 my-1 h-px bg-border" />
  )
}

function SearchEmpty({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
  return (
    <div className="py-4 text-center">
      {query.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;
          </p>
          <Button variant="link" size="sm" className="mt-1" onClick={() => onSearch(query)}>
            View all results
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Type to search...</p>
      )}
    </div>
  )
}

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([])
  const [popularTags, setPopularTags] = useState<PopularTag[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    setRecentSearches(JSON.parse(localStorage.getItem("recentSearches") || "[]"))
  }, [])

  const addToRecentSearches = (search: string) => {
    if (!search.trim()) return
    const newSearches = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5)
    localStorage.setItem("recentSearches", JSON.stringify(newSearches))
    setRecentSearches(newSearches)
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    addToRecentSearches(searchQuery)
    setOpen(false)
    router.push(`/blog/search?q=${encodeURIComponent(searchQuery)}`)
  }

  useEffect(() => {
    const searchPosts = async () => {
      if (query.trim().length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (!response.ok) throw new Error(data.error || "Search failed")
        setResults(data.results || [])
      } catch (err) {
        console.error("Search error:", err)
        setResults([])
        toast.error("Failed to search posts")
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchPosts, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const [trendingRes, tagsRes] = await Promise.all([
          fetch("/api/search/trending"),
          fetch("/api/search/tags")
        ])

        const [trending, tags] = await Promise.all([
          trendingRes.json(),
          tagsRes.json()
        ])

        setTrendingSearches(trending)
        setPopularTags(tags)
      } catch (error) {
        console.error("Failed to fetch trending data:", error)
      }
    }

    fetchTrending()
  }, [])

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
        <span className="inline-flex truncate text-sm">Search posts...</span>
        <kbd className="absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogTitle className="sr-only">Search Posts</DialogTitle>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="border-none focus-visible:ring-0"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1">
            {loading && (
              <div className="py-4 text-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto" />
              </div>
            )}

            {!loading && results.length > 0 && (
              <SearchGroup heading={`${results.length} results`}>
                {results.map((result) => (
                  <SearchItem
                    key={result.id}
                    onSelect={() => {
                      router.push(`/blog/${result.slug}`)
                      setOpen(false)
                    }}
                    className="gap-2"
                  >
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-medium text-sm">{result.title}</span>
                      {result.summary && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{result.summary}</span>
                      )}
                      {result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.tags.map((tag) => (
                            <TagBadge
                              key={tag}
                              onClick={() => {
                                router.push(`/blog/tag/${encodeURIComponent(tag)}`)
                                setOpen(false)
                              }}
                              className="cursor-pointer"
                            >
                              #{tag}
                            </TagBadge>
                          ))}
                        </div>
                      )}
                    </div>
                  </SearchItem>
                ))}
              </SearchGroup>
            )}

            {query.length === 0 && (
              <>
                {trendingSearches.length > 0 && (
                  <SearchGroup heading="Trending">
                    {trendingSearches.map((trend) => (
                      <SearchItem
                        key={trend.query}
                        onSelect={() => handleSearch(trend.query)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Search className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{trend.query}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{trend.count}</span>
                      </SearchItem>
                    ))}
                  </SearchGroup>
                )}

                {popularTags.length > 0 && (
                  <SearchGroup heading="Popular Tags">
                    <div className="p-2 flex flex-wrap gap-1.5">
                      {popularTags.map((tag) => (
                        <SearchItem
                          key={tag.name}
                          onSelect={() => {
                            router.push(`/blog/tag/${encodeURIComponent(tag.name)}`)
                            setOpen(false)
                          }}
                          className="bg-secondary hover:bg-secondary/80 px-2 py-0.5 rounded-full text-xs transition-colors"
                        >
                          #{tag.name}
                          <span className="ml-1 text-muted-foreground">{tag.count}</span>
                        </SearchItem>
                      ))}
                    </div>
                  </SearchGroup>
                )}

                {recentSearches.length > 0 && (
                  <>
                    <SearchSeparator />
                    <SearchGroup heading="Recent">
                      {recentSearches.map((search) => (
                        <SearchItem
                          key={search}
                          onSelect={() => handleSearch(search)}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center">
                            <Search className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{search}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              const newSearches = recentSearches.filter((s) => s !== search)
                              localStorage.setItem("recentSearches", JSON.stringify(newSearches))
                              setRecentSearches(newSearches)
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove from history</span>
                          </Button>
                        </SearchItem>
                      ))}
                    </SearchGroup>
                  </>
                )}
              </>
            )}

            <SearchEmpty query={query} onSearch={handleSearch} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
