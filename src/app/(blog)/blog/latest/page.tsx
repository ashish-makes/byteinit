import React from 'react'
import { Metadata } from 'next'
import BlogList from '../../../../components/blog/BlogList'

export const metadata: Metadata = {
  title: 'Latest Posts | Blog',
  description: 'Most recent blog posts'
}

export default function LatestPage() {
  return (
    <div className="w-full max-w-none">
      <BlogList section="latest" />
    </div>
  )
} 