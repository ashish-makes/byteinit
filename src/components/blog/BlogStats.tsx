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

interface BlogStatsProps {
  followerCount: number
  readingTime: number
  views: number
  publishDate: Date
}

export function BlogStats({ 
  followerCount: initialFollowerCount,
  readingTime,
  views,
  publishDate
}: BlogStatsProps) {
  const [followers, setFollowers] = useState(initialFollowerCount)

  // Subscribe to follower count changes
  useEffect(() => {
    const channel = new BroadcastChannel('follower-update')
    
    channel.onmessage = (event) => {
      if (event.data.type === 'FOLLOWER_UPDATE') {
        setFollowers(event.data.count)
      }
    }

    return () => channel.close()
  }, [])

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={followers}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {formatCount(followers)}
          </motion.span>
        </AnimatePresence>
        <span>{followers === 1 ? 'follower' : 'followers'}</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-1">
        <ClockIcon className="h-3 w-3" />
        <span>{readingTime} min read</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-1">
        <EyeIcon className="h-3 w-3" />
        <span>{formatCount(views)} views</span>
      </div>
      <span>•</span>
      <time 
        dateTime={publishDate.toISOString()}
        itemProp="datePublished"
      >
        {formatDistanceToNowStrict(publishDate)} ago
      </time>
    </div>
  )
} 