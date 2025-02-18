/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/ResourceListPage.tsx

"use client"

import { useState, useEffect } from "react";
import { ResourceCard } from "./ResourceCard";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Layers, Filter } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

// Resource interface definition
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  category: ResourceCategory;
  tags: string[];
  uniqueViews: number;
  totalViews: number;
  likes: number;
  saves: number;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

// Add enums from your schema
enum ResourceType {
  LIBRARY = "LIBRARY",
  TOOL = "TOOL",
  FRAMEWORK = "FRAMEWORK",
  TUTORIAL = "TUTORIAL",
  TEMPLATE = "TEMPLATE",
  ICON_SET = "ICON_SET",
  ILLUSTRATION = "ILLUSTRATION",
  COMPONENT_LIBRARY = "COMPONENT_LIBRARY",
  CODE_SNIPPET = "CODE_SNIPPET",
  API = "API",
  DOCUMENTATION = "DOCUMENTATION",
  COURSE = "COURSE",
  OTHER = "OTHER"
}

enum ResourceCategory {
  FRONTEND = "FRONTEND",
  BACKEND = "BACKEND",
  FULLSTACK = "FULLSTACK",
  DEVOPS = "DEVOPS",
  MOBILE = "MOBILE",
  AI_ML = "AI_ML",
  DATABASE = "DATABASE",
  SECURITY = "SECURITY",
  UI_UX = "UI_UX",
  DESIGN = "DESIGN",
  MACHINE_LEARNING = "MACHINE_LEARNING",
  CLOUD = "CLOUD",
  OTHER = "OTHER"
}

interface ResourcesListingProps {
  initialFilter?: {
    category?: string;
    type?: string;
  };
  hideFilters?: boolean;
  headerTitle?: string;
}

// Predefined resource types and categories
const resourceTypes = [
  "ALL",
  "LIBRARY",
  "TOOL",
  "FRAMEWORK",
  "TUTORIAL",
  "TEMPLATE",
  "ICON_SET",
  "ILLUSTRATION",
  "COMPONENT_LIBRARY",
  "CODE_SNIPPET",
  "API",
  "DOCUMENTATION",
  "COURSE",
  "OTHER",
];

const resourceCategories = [
  "ALL",
  "FRONTEND",
  "BACKEND",
  "FULLSTACK",
  "DEVOPS",
  "MOBILE",
  "AI_ML",
  "DATABASE",
  "SECURITY",
  "UI_UX",
  "DESIGN",
  "MACHINE_LEARNING",
  "CLOUD",
  "OTHER",
];

// Skeleton Component for ResourceCard
function ResourceCardSkeleton() {
  return (
    <div
      className={cn(
        "relative w-full h-full flex flex-col overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-white dark:border-gray-50/[.1] dark:bg-neutral-900"
      )}
    >
      {/* Icon and Title Section */}
      <div className="flex flex-row items-center gap-3">
        {/* Icon Skeleton */}
        <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800" />

        {/* Title and Category Skeleton */}
        <div className="flex flex-col flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-3 w-1/2 mt-2 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Bookmark Button Skeleton */}
        <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Description Skeleton */}
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full bg-gray-200 dark:bg-gray-800" />
        <Skeleton className="h-3 w-2/3 bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Tags Section Skeleton */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>

      {/* Author and Date Section Skeleton */}
      <div className="mt-4 flex flex-col gap-2">
        {/* Author Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Date and Link Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-800" />
          <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function ResourcesListing({
  initialFilter,
  hideFilters = false,
  headerTitle
}: ResourcesListingProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState({
    type: initialFilter?.type || "ALL",
    category: initialFilter?.category || "ALL",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { savedResourceIds, toggleBookmark } = useBookmarks();

  useEffect(() => {
    fetchResources();
  }, [filter.type, filter.category]);

  useEffect(() => {
    const safeResources = Array.isArray(resources) ? resources : [];
    const filtered = safeResources
      .filter(
        (resource) =>
          (filter.type === "ALL" || resource.type === filter.type) &&
          (filter.category === "ALL" || resource.category === filter.category) &&
          (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => (b.likes || 0) - (a.likes || 0));
    setFilteredResources(filtered);
  }, [resources, filter, searchTerm]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type !== "ALL") params.append("type", filter.type);
      if (filter.category !== "ALL") params.append("category", filter.category);

      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to fetch resources");
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkClick = async (resourceId: string) => {
    await toggleBookmark(resourceId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Main Heading with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">
          {headerTitle || "Developer Resources"}
        </h1>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-10 rounded-full bg-muted/50 border-0 focus:ring-1 focus:ring-primary"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "h-9 px-3 gap-2 text-sm font-normal",
                  filter.type !== "ALL" && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <span className="text-muted-foreground">Type:</span>
                {filter.type === "ALL" ? "All" : filter.type.toLowerCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1">
              <ScrollArea className="h-[280px]">
                <DropdownMenuItem
                  onClick={() => setFilter(prev => ({ ...prev, type: "ALL" }))}
                  className={cn(
                    "mb-1 rounded-sm",
                    filter.type === "ALL" ? "bg-primary/10 text-primary" : ""
                  )}
                >
                  All Types
                </DropdownMenuItem>
                {Object.values(ResourceType).map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setFilter(prev => ({ ...prev, type }))}
                    className={cn(
                      "mb-1 rounded-sm",
                      filter.type === type ? "bg-primary/10 text-primary" : ""
                    )}
                  >
                    {type.replace('_', ' ').toLowerCase()}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "h-9 px-3 gap-2 text-sm font-normal",
                  filter.category !== "ALL" && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <span className="text-muted-foreground">Category:</span>
                {filter.category === "ALL" ? "All" : filter.category.toLowerCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-1">
              <ScrollArea className="h-[280px]">
                <DropdownMenuItem
                  onClick={() => setFilter(prev => ({ ...prev, category: "ALL" }))}
                  className={cn(
                    "mb-1 rounded-sm",
                    filter.category === "ALL" ? "bg-primary/10 text-primary" : ""
                  )}
                >
                  All Categories
                </DropdownMenuItem>
                {Object.values(ResourceCategory).map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setFilter(prev => ({ ...prev, category }))}
                    className={cn(
                      "mb-1 rounded-sm",
                      filter.category === category ? "bg-primary/10 text-primary" : ""
                    )}
                  >
                    {category.replace('_', ' ').toLowerCase()}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {(filter.type !== "ALL" || filter.category !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter({ type: "ALL", category: "ALL" })}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Resource Count */}
      <div className="text-sm text-muted-foreground">
        {filteredResources.length} resources found
        {(filter.type !== "ALL" || filter.category !== "ALL") && (
          <span className="ml-2 text-xs">
            {filter.type !== "ALL" && `• ${filter.type.toLowerCase()}`}
            {filter.category !== "ALL" && `• ${filter.category.toLowerCase()}`}
          </span>
        )}
      </div>

      {/* Resource List or Skeleton Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ResourceCardSkeleton />
            </motion.div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 rounded-xl"
        >
          <Layers className="h-16 w-16 mx-auto text-neutral-400 mb-6" />
          <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-4">
            No resources found matching your search
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ResourceCard
                  {...resource}
                  isBookmarked={savedResourceIds.includes(resource.id)}
                  onBookmarkClick={() => handleBookmarkClick(resource.id)}
                  tags={[resource.type, resource.category]}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}