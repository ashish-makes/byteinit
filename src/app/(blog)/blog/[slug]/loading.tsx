import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function BlogPostLoading() {
  return (
    <div className="w-full bg-background">
      {/* Sticky Header */}
      <div className="sticky top-[3.5rem] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-11 items-center justify-between px-3">
          <Skeleton className="h-4 w-[180px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
        <article className="w-full">
          {/* Author and Meta */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Title and Summary */}
          <div className="space-y-4 mb-6">
            <Skeleton className="h-8 w-[90%]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 mb-6">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>

          {/* Cover Image */}
          <Skeleton className="w-full aspect-[2/1] rounded-xl mb-8" />

          {/* Content */}
          <div className="space-y-4 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[98%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[88%]" />
          </div>

          {/* Author Bio */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-6 pt-4 border-t">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-lg border p-3">
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
} 