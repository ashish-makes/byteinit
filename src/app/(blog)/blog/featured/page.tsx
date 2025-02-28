import React from 'react'
import { Metadata } from 'next'
import BlogList from '../../../../components/blog/BlogList'

export const metadata: Metadata = {
  title: 'Featured Posts | Blog',
  description: 'Top performing posts from this week'
}

export default function FeaturedPage() {
  return (
    <div className="w-full max-w-none">
      <BlogList section="featured" />
    </div>
  )
} 