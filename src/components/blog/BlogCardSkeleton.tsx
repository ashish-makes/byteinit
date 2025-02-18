"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function BlogCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-[0.5px] border-border/40 shadow-none">
      <div className="p-4">
        {/* Author and Date */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-16 bg-muted-foreground/10" />
          </div>
        </div>

        {/* Title and Content */}
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[95%]" />
            <Skeleton className="h-5 w-[80%]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-muted-foreground/10" />
            <Skeleton className="h-3 w-[90%] bg-muted-foreground/10" />
            <Skeleton className="h-3 w-[75%] bg-muted-foreground/10" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-5 w-16 rounded-full bg-secondary/40" />
          <Skeleton className="h-5 w-20 rounded-full bg-secondary/40" />
          <Skeleton className="h-5 w-14 rounded-full bg-secondary/40" />
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