"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FeaturedPostsSkeleton() {
  return (
    <section className="w-full border-b bg-accent/5">
      <div className="py-4 sm:py-6 px-3 sm:px-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
          </div>
          <Skeleton className="h-8 w-[70px] rounded-md" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <FeaturedCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedCardSkeleton() {
  return (
    <Card className="relative overflow-hidden h-full border-[0.5px] border-border/40 shadow-none">
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        {/* Author and Date */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[75%]" />
        </div>

        {/* Content Preview */}
        <div className="hidden sm:block space-y-1">
          <Skeleton className="h-3 w-full bg-muted-foreground/10" />
          <Skeleton className="h-3 w-[90%] bg-muted-foreground/10" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full bg-secondary/40" />
          <Skeleton className="h-5 w-20 rounded-full bg-secondary/40" />
        </div>

        {/* Engagement */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-3 w-6 bg-muted-foreground/10" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-6 bg-muted-foreground/10" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </Card>
  )
} 