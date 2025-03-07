"use client"

import { useState, useEffect } from "react"
import { ClockIcon, EyeIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNowStrict } from "date-fns"

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

export const BlogStats = ({
  followerCount,
  readingTime,
  views,
  publishDate
}: {
  followerCount: number
  readingTime: number
  views: number
  publishDate: Date
}) => (
  <div className="relative max-w-full">
    {/* Container with fade effect */}
    <div className="relative">
      {/* Fade effect overlay - right side only */}
      <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent z-10" />
      
      {/* Scrollable content */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto no-scrollbar pr-4">
        <span className="whitespace-nowrap">{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
        <span>•</span>
        <span className="whitespace-nowrap">{readingTime} min read</span>
        <span>•</span>
        <span className="whitespace-nowrap">{views} {views === 1 ? 'view' : 'views'}</span>
        <span>•</span>
        <span className="whitespace-nowrap">{formatDistanceToNowStrict(publishDate)} ago</span>
      </div>
    </div>
  </div>
) 