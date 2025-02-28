// src/app/(blog)/blog/topic/[topic]/page.tsx
import React from 'react'
import { Metadata } from 'next'
import BlogList from '../../../../../components/blog/BlogList'

interface TopicPageProps {
  params: Promise<{ topic: string }>
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { topic } = await params
  const decodedTopic = decodeURIComponent(topic)
  return {
    title: `${decodedTopic} Posts | Blog`,
    description: `Blog posts about ${decodedTopic}`
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic } = await params
  const decodedTopic = decodeURIComponent(topic)
  
  return (
    <div className="w-full max-w-none">
      <BlogList topic={decodedTopic} />
    </div>
  )
}
