"use client"

import { StickyHeader } from "./StickyHeader"
import { vote, toggleSave } from "@/app/(blog)/blog/actions"

export function StickyHeaderClient({ post }: { post: any }) {
  return (
    <StickyHeader 
      post={post} 
      onVote={vote}
      onSave={toggleSave}
    />
  )
} 