/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, MessageSquare, Eye } from 'lucide-react';
import Link from 'next/link';

interface TrendingPost {
  id: string
  title: string
  slug: string
  _count: {
    votes: number
    comments: number
    views: number
  }
}

interface RightSidebarProps {
  trendingPosts?: TrendingPost[]
}

const PostCard = ({ post, index }: { post: TrendingPost; index: number }) => (
  <Link 
    href={`/blog/${post.slug}`}
    className="block"
  >
    <div className="px-3 py-2 rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium line-clamp-2">
            {post.title}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3" />
              {post._count.votes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {post._count.comments}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {post._count.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const RightSidebar = ({ trendingPosts = [] }: RightSidebarProps) => {
  if (!trendingPosts?.length) {
    return null;
  }

  return (
    <ScrollArea className="h-full">
      <div className="px-2 py-3">
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70">
            TRENDING TODAY
          </h4>
          <div className="space-y-1">
            {trendingPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default RightSidebar;