"use client"

import { StickyHeader } from "./StickyHeader"
import { vote, toggleSave } from "@/app/(blog)/blog/actions"

interface Post {
  id: string
  title: string
  votes: Array<{ type: 'UP' | 'DOWN' }>
  saves?: Array<{ id: string }>
  _count: {
    comments: number
  }
}

export function StickyHeaderClient({ post }: { post: Post }) {
  return (
    <StickyHeader 
      post={post} 
      onVote={vote}
      onSave={toggleSave}
    />
  )
} 