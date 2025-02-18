"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FeaturedPostsSkeleton() {
  return (
    <section className="w-full border-b bg-accent/5">
      <div className="py-4 sm:py-6 px-3 sm:px-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16 bg-muted-foreground/10" />
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
      <div className="p-3 sm:p-4">
        {/* Author and Date */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-16 bg-muted-foreground/10" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-[90%]" />
          <Skeleton className="h-5 w-[75%]" />
        </div>

        {/* Content Preview */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-3 w-full bg-muted-foreground/10" />
          <Skeleton className="h-3 w-[90%] bg-muted-foreground/10" />
          <Skeleton className="h-3 w-[60%] bg-muted-foreground/10" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-5 w-16 rounded-full bg-secondary/40" />
          <Skeleton className="h-5 w-20 rounded-full bg-secondary/40" />
        </div>

        {/* Engagement */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-8 bg-muted-foreground/10" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-8 bg-muted-foreground/10" />
            </div>
          </div>
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </Card>
  )
} 