import React from 'react'
import { Metadata } from 'next'
import BlogList from "@/components/blog/BlogList"
import { auth } from '../../../../auth'
import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Following | Blog',
  description: 'Posts from authors you follow'
}

export default async function FollowingPage() {
  const session = await auth()
  
  if (!session?.user) {
    const callbackUrl = encodeURIComponent('/blog/following')
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3 px-4">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Sign in to discover and follow your favorite authors
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/api/auth/signin?callbackUrl=${callbackUrl}`} className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-none">
      <BlogList section="following" />
    </div>
  )
} 