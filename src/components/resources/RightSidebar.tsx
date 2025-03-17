/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Bookmark,
  ThumbsUp,
  Zap,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  RiTwitterXFill, 
  RiGithubFill, 
  RiLinkedinFill, 
  RiDiscordFill,
  RiProductHuntFill
} from 'react-icons/ri';
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';

interface TrendingResource {
  id: string;
  title: string;
  url: string;
  likes: number;
  saves: number;
  views: number;
}

interface RightSidebarProps {
  trendingResources?: TrendingResource[];
}

const ResourceCard = ({ resource, index }: { resource: TrendingResource; index: number }) => (
  <Link 
    href={resource.url}
    className="block"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div className="px-3 py-2 rounded-lg hover:bg-accent/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium line-clamp-2">
            {resource.title}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              {resource.likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bookmark className="h-3 w-3" />
              {resource.saves}
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
    href: "https://twitter.com/byteinit",
    color: "hover:text-foreground dark:hover:text-white",
  },
  {
    name: "GitHub",
    icon: RiGithubFill,
    href: "https://github.com/byteinit",
    color: "hover:text-foreground dark:hover:text-white",
  },
  {
    name: "LinkedIn",
    icon: RiLinkedinFill,
    href: "https://linkedin.com/company/byteinit",
    color: "hover:text-[#0A66C2]",
  },
  {
    name: "Discord",
    icon: RiDiscordFill,
    href: "https://discord.gg/byteinit",
    color: "hover:text-[#5865F2]",
  },
  {
    name: "Product Hunt",
    icon: RiProductHuntFill,
    href: "https://producthunt.com/@byteinit",
    color: "hover:text-[#DA552F]",
  },
];

const RightSidebar = ({ trendingResources = [] }: RightSidebarProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="px-2 py-3 space-y-6">
        {/* Trending Resources */}
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            TRENDING TODAY
          </h4>
          {trendingResources.length > 0 ? (
            <div className="space-y-1">
              {trendingResources.slice(0, 10).map((resource, index) => (
                <ResourceCard key={resource.id} resource={resource} index={index} />
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">No trending resources found</p>
            </div>
          )}
        </div>

        {/* Submit Resource */}
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Rocket className="h-3 w-3" />
            CONTRIBUTE
          </h4>
          <div className="px-3 py-2 bg-accent/30 rounded-lg">
            <p className="text-sm mb-2">Found a useful resource? Share it with the community!</p>
            <Button size="sm" className="w-full" asChild>
              <Link href="/resources/submit">
                Submit a Resource
              </Link>
            </Button>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 flex items-center gap-2">
            <Zap className="h-3 w-3" />
            WEEKLY RESOURCES
          </h4>
          <div className="px-3 py-2 bg-accent/30 rounded-lg">
            <p className="text-sm mb-2">Get the best resources delivered to your inbox every week.</p>
            <form className="space-y-2">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="h-8 text-sm" 
              />
              <Button size="sm" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-2">
          <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70">
            CONNECT WITH US
          </h4>
          <div className="flex flex-wrap justify-center gap-2 px-3">
            <TooltipProvider>
              {socialLinks.map((link) => (
                <Tooltip key={link.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8 rounded-full", link.color)}
                      asChild
                    >
                      <Link href={link.href} target="_blank" rel="noopener noreferrer">
                        <link.icon className="h-4 w-4" />
                        <span className="sr-only">{link.name}</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{link.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default RightSidebar; 