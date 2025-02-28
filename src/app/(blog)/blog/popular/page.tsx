import React from 'react'
import { Metadata } from 'next'
import BlogList from '../../../../components/blog/BlogList'

export const metadata: Metadata = {
  title: 'Popular Posts | Blog',
  description: 'Most viewed and engaged blog posts'
}

export default function PopularPage() {
  return (
    <div className="w-full max-w-none">
      <BlogList section="popular" />
    </div>
  )
} 