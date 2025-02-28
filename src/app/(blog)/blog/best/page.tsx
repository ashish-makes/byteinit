import React from 'react'
import { Metadata } from 'next'
import BlogList from '../../../../components/blog/BlogList';

export const metadata: Metadata = {
  title: 'Best Posts | Blog',
  description: 'Highest rated blog posts of all time'
}

export default function BestPage() {
  return (
    <div className="w-full max-w-none">
      <BlogList section="best" />
    </div>
  )
} 