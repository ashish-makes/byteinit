/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { ResourceCard } from "./ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Layers, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  createdAt?: string;
  user?: {
    name: string;
    image?: string;
  };
  userId: string; // Add userId to identify the resource owner
}

export default function ManageResourcesListing() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);

  // Fetch resources
  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/manage-resources");
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      const data = await response.json();
      setResources(data);
    } catch (error) {
      toast.error("Failed to fetch resources");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete resource
  const handleDeleteResource = async () => {
    if (!deleteResourceId) return;

    try {
      const response = await fetch(`/api/resources/${deleteResourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }

      // Refresh the resources list
      await fetchResources();
      toast.success("Resource deleted successfully");
    } catch (error) {
      toast.error("Failed to delete resource");
    } finally {
      setDeleteResourceId(null);
    }
  };

  // Filter resources
  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Layers className="h-6 w-6 text-neutral-600" />
          Manage Resources
        </h1>
        <div className="text-neutral-500 text-sm">
          {filteredResources.length} resource
          {filteredResources.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 rounded-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Resource List or Skeleton Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          className="text-center py-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
        >
          <Layers className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <p className="text-neutral-600 dark:text-neutral-300 text-base mb-2">
            No resources found matching your search
          </p>
          <Link
            href="/resources/new"
            className="text-primary hover:underline text-sm"
          >
            Add a new resource
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ResourceCard
                  {...resource}
                  isBookmarked={false} // Not relevant for manage page
                  onBookmarkClick={() => {}} // Not relevant for manage page
                  onDelete={() => setDeleteResourceId(resource.id)}
                  onEdit={`/dashboard/resources/edit/${resource.id}`}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteResourceId}
        onOpenChange={() => setDeleteResourceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Skeleton Component for ResourceCard
function ResourceCardSkeleton() {
  return (
    <div
      className={cn(
        "relative w-full h-full flex flex-col overflow-hidden rounded-lg border p-4",
        "border-gray-950/[.1] bg-white dark:border-gray-50/[.1] dark:bg-neutral-900" // Darker background for dark mode
      )}
    >
      {/* Icon and Title Section */}
      <div className="flex flex-row items-center gap-3">
        {/* Icon Skeleton */}
        <Skeleton className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}

        {/* Title and Category Skeleton */}
        <div className="flex flex-col flex-1 min-w-0">
          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
          <Skeleton className="h-3 w-1/2 mt-2 bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
        </div>

        {/* Bookmark Button Skeleton */}
        <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
      </div>

      {/* Description Skeleton */}
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
        <Skeleton className="h-3 w-2/3 bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
      </div>

      {/* Tags Section Skeleton */}
      <div className="flex flex-wrap gap-2 mt-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-800" // Darker shade
          />
        ))}
      </div>

      {/* Author and Date Section Skeleton */}
      <div className="mt-4 flex flex-col gap-2">
        {/* Author Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
          <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
        </div>

        {/* Date and Link Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
          <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" /> {/* Darker shade */}
        </div>
      </div>
    </div>
  );
}