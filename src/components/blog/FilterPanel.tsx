"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Filter, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterPanelProps {
  query?: string
  sort?: string
  filter?: string
}

export function FilterPanel({ query = "", sort = "date", filter = "all" }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(query)
  const [selectedSort, setSelectedSort] = useState(sort)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const hasActiveFilters = searchQuery || selectedSort !== "date" || selectedFilters.length > 0

  const sortOptions = [
    { id: "date", label: "Latest First" },
    { id: "oldest", label: "Oldest First" },
    { id: "title", label: "By Title" },
    { id: "views", label: "Most Viewed" }
  ]

  const filterOptions = [
    { id: "published", label: "Published Only" },
    { id: "featured", label: "Featured Posts" },
    { id: "hasComments", label: "With Comments" },
    { id: "hasImages", label: "With Images" }
  ]

  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId === selectedSort ? "date" : sortId)
  }

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedSort("date")
    setSelectedFilters([])
  }

  const handleApply = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("query", searchQuery)
    if (selectedSort !== "date") params.set("sort", selectedSort)
    if (selectedFilters.length > 0) {
      selectedFilters.forEach(filter => {
        params.append("filter", filter)
      })
    }
    
    window.location.href = `/dashboard/blog?${params.toString()}`
    setIsOpen(false)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Button */}
      <Button
        size="icon"
        className={cn(
          "h-10 w-10 rounded-full fixed bottom-6 right-6 z-50",
          "shadow-[0_8px_16px_-6px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_-6px_rgba(0,0,0,0.15)]",
          "transition-all duration-300",
          hasActiveFilters && "bg-primary hover:bg-primary/90"
        )}
        onClick={() => setIsOpen(true)}
      >
        <Filter className="h-4 w-4" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-foreground flex items-center justify-center">
            <span className="text-[10px] font-medium text-primary">
              {[
                searchQuery && "1",
                selectedSort !== "date" && "1",
                selectedFilters.length > 0 && String(selectedFilters.length)
              ].filter(Boolean).length}
            </span>
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-[280px] bg-background z-50",
          "shadow-[0_0_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_0_40px_-10px_rgba(0,0,0,0.2)]",
          "transition-transform duration-300 ease-in-out",
          "border-l border-border/40",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <div>
              <h2 className="font-medium">Filter & Sort</h2>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? `${[
                  searchQuery && "Search",
                  selectedSort !== "date" && "Sort",
                  selectedFilters.length > 0 && `${selectedFilters.length} filters`
                ].filter(Boolean).join(", ")}` : 'No filters applied'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Search */}
            <div className="p-4 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  className="pl-9 h-9 text-sm bg-muted/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="p-4 border-b border-border/40">
              <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                Sort By
              </Label>
              <div className="space-y-3">
                {sortOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between">
                    <Label htmlFor={option.id} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                    <Switch
                      id={option.id}
                      checked={selectedSort === option.id}
                      onCheckedChange={() => handleSortChange(option.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="p-4">
              <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                Show Only
              </Label>
              <div className="space-y-3">
                {filterOptions.map((filter) => (
                  <div key={filter.id} className="flex items-center justify-between">
                    <Label htmlFor={filter.id} className="text-sm cursor-pointer">
                      {filter.label}
                    </Label>
                    <Switch
                      id={filter.id}
                      checked={selectedFilters.includes(filter.id)}
                      onCheckedChange={() => toggleFilter(filter.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-muted/40 border-t border-border/40">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleReset}
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>
              <Button 
                size="sm"
                className="flex-1"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 