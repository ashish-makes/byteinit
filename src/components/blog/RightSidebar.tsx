/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowUp, MessageSquare, Eye, TrendingUp, Hash, Users, Medal, Trophy, Star, Award } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  RiTwitterXFill, 
  RiGithubFill, 
  RiLinkedinFill, 
  RiInstagramLine,
  RiDiscordFill 
} from 'react-icons/ri';
import { cn } from "@/lib/utils"

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

interface Author {
  id: string
  name: string | null
  image: string | null
  username: string | null
  reputation: number
  _count: {
    posts: number
    followers: number
    following: number
  }
}

interface RightSidebarProps {
  trendingPosts: TrendingPost[];
  popularTags?: string[];
  topAuthors: Author[];
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

const socialLinks = [
  {
    name: "Twitter",
    icon: RiTwitterXFill,
    href: "https://twitter.com/yourusername",
    color: "hover:text-foreground dark:hover:text-white",
  },
  {
    name: "GitHub",
    icon: RiGithubFill,
    href: "https://github.com/yourusername",
    color: "hover:text-foreground dark:hover:text-white",
  },
  {
    name: "LinkedIn",
    icon: RiLinkedinFill,
    href: "https://linkedin.com/in/yourusername",
    color: "hover:text-[#0A66C2]",
  },
  {
    name: "Instagram",
    icon: RiInstagramLine,
    href: "https://instagram.com/yourusername",
    color: "hover:text-[#E4405F]",
  },
  {
    name: "Discord",
    icon: RiDiscordFill,
    href: "https://discord.gg/yourusername",
    color: "hover:text-[#5865F2]",
  },
]

// Add these reputation constants
const REPUTATION_LEVELS = {
  BEGINNER: { min: 0, max: 99, icon: Star, color: "text-zinc-400" },
  INTERMEDIATE: { min: 100, max: 499, icon: Medal, color: "text-blue-500" },
  ADVANCED: { min: 500, max: 999, icon: Award, color: "text-indigo-500" },
  EXPERT: { min: 1000, max: 4999, icon: Trophy, color: "text-amber-500" },
  MASTER: { min: 5000, max: Infinity, icon: Trophy, color: "text-yellow-500" }
} as const;

// Add this helper function
function getAuthorReputation(reputation: number) {
  // Get level based on reputation
  const level = Object.entries(REPUTATION_LEVELS).find(
    ([_, range]) => reputation >= range.min && reputation <= range.max
  )?.[0] || "BEGINNER";

  // Get badge count based on reputation milestones
  const badgeCount = Math.min(3, Math.floor(reputation / 500));

  return {
    level,
    badgeCount,
    ...REPUTATION_LEVELS[level as keyof typeof REPUTATION_LEVELS]
  };
}

function getAuthorRank(index: number) {
  switch (index) {
    case 0:
      return {
        icon: Trophy,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      }
    case 1:
      return {
        icon: Medal,
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
      }
    case 2:
      return {
        icon: Medal,
        color: "text-amber-700",
        bgColor: "bg-amber-700/10",
      }
    default:
      return {
        icon: Star,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      }
  }
}

const RightSidebar = ({ trendingPosts = [], popularTags = [], topAuthors }: RightSidebarProps) => {
  React.useEffect(() => {
    // Log the exact structure of topAuthors
    console.log('RightSidebar authors:', topAuthors.map(author => ({
      name: author.name,
      _count: author._count,
      followerCount: author._count?.followers,
      type: typeof author._count?.followers
    })));
  }, [topAuthors]);

  return (
    <ScrollArea className="h-full">
      <div className="px-2 py-3 space-y-6">
        {/* Trending Posts */}
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            TRENDING TODAY
          </h4>
          <div className="space-y-1">
            {trendingPosts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Hash className="h-3 w-3" />
            POPULAR TAGS
          </h4>
          <div className="flex flex-wrap gap-2 px-3">
            {popularTags.map(tag => (
              <Button 
                key={tag} 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs"
                asChild
              >
                <Link href={`/blog/tag/${tag}`}>{tag}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Top Authors */}
        <div className="space-y-1.5">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Users className="h-3 w-3" />
            TOP AUTHORS ({topAuthors?.length || 0})
          </h4>
          <div className="space-y-1">
            {topAuthors?.map((author, index) => {
              // Debug log for each author during render
              console.log(`Rendering author ${author.name}:`, {
                _count: author._count,
                followers: author._count?.followers
              });

              const rank = getAuthorRank(index);
              const RankIcon = rank.icon;

              return (
                <Link 
                  key={author.id}
                  href={`/u/${author.username}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={author.image || ""} alt={author.name || ""} />
                      <AvatarFallback>{author.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {author.name || author.username || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{author._count?.posts ?? 0} posts</span>
                        <span>•</span>
                        <span>{author._count?.followers ?? 0} followers</span>
                        <span>•</span>
                        <span>{author._count?.following ?? 0} following</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {author.reputation > 0 && (
                      <>
                        <div className="flex -space-x-1">
                          {/* Get reputation details */}
                          {(() => {
                            const rep = getAuthorReputation(author.reputation);
                            return Array.from({ length: rep.badgeCount }).map((_, i) => (
                              <div 
                                key={i}
                                className={cn(
                                  "h-4 w-4 rounded-full border border-background",
                                  "flex items-center justify-center",
                                  "bg-background/5"
                                )}
                              >
                                <rep.icon 
                                  className={cn("h-3 w-3", rep.color)} 
                                />
                              </div>
                            ));
                          })()}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {author.reputation.toLocaleString()}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {getAuthorReputation(author.reputation).level.toLowerCase()} level author
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70">
            CONNECT WITH US
          </h4>
          <div className="flex flex-wrap justify-center gap-2 px-3">
            <TooltipProvider>
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Tooltip key={social.name}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-full bg-muted/50 ${social.color} transition-all hover:scale-110 hover:bg-muted`}
                        asChild
                      >
                        <Link href={social.href} target="_blank" rel="noopener noreferrer">
                          <Icon className="h-5 w-5" />
                          <span className="sr-only">{social.name}</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Follow on {social.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="p-4 rounded-lg bg-accent/50 space-y-3">
          <h4 className="text-sm font-medium">Subscribe to our newsletter</h4>
          <p className="text-xs text-muted-foreground">Get the latest posts delivered right to your inbox</p>
          <Button className="w-full" size="sm">Subscribe</Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default RightSidebar;