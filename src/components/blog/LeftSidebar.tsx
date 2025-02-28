'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Newspaper, 
  Flame, 
  Sparkles, 
  Bookmark, 
  History,
  Code2,
  Globe,
  Brain,
  Cpu,
  Smartphone,
  Cloud,
  Shield,
  Database,
  Users,
  Settings,
  HelpCircle,
  Rss,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from "@/components/ui/badge"

interface NavItem {
  readonly icon: React.ElementType;
  readonly label: string;
  readonly href: string;
  count?: number;
}

interface LeftSidebarProps {
  savedCount?: number;
}

const LeftSidebar = ({ savedCount = 0 }: LeftSidebarProps) => {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    discover: true,
    personal: true,
    topics: true,
    help: true
  });
  
  console.log("LeftSidebar rendered with savedCount:", savedCount);
  
  const mainNav: NavItem[] = [
    { icon: Home, label: 'Home', href: '/blog' },
  ];

  const discoverNav: NavItem[] = [
    { icon: Flame, label: 'Popular', href: '/blog/popular' },
    { icon: Newspaper, label: 'Latest', href: '/blog/latest' },
    { icon: Sparkles, label: 'Best', href: '/blog/best' },
    { icon: Users, label: 'Following', href: '/blog/following' },
  ];

  const personalNav: NavItem[] = [
    { 
      icon: Bookmark, 
      label: 'Saved', 
      href: '/blog/saved',
      count: savedCount 
    },
    { 
      icon: History, 
      label: 'History', 
      href: '/blog/history' 
    }
  ];

  const helpNav: NavItem[] = [
    { 
      icon: HelpCircle, 
      label: 'Help Center', 
      href: '/help' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/dashboard/profile' 
    },
    { 
      icon: Rss, 
      label: 'RSS Feed', 
      href: '/feed.xml' 
    },
  ];

  const topics: readonly NavItem[] = [
    { icon: Code2, label: 'Programming', href: '/blog/topic/programming' },
    { icon: Globe, label: 'Web Development', href: '/blog/topic/web-development' },
    { icon: Brain, label: 'Machine Learning', href: '/blog/topic/machine-learning' },
    { icon: Cpu, label: 'AI', href: '/blog/topic/artificial-intelligence' },
    { icon: Smartphone, label: 'Mobile Dev', href: '/blog/topic/mobile-development' },
    { icon: Cloud, label: 'Cloud', href: '/blog/topic/cloud-computing' },
    { icon: Shield, label: 'Security', href: '/blog/topic/security' },
    { icon: Database, label: 'Databases', href: '/blog/topic/databases' },
  ] as const;

  const NavItem = ({ item }: { item: NavItem }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start",
        pathname === item.href && "bg-accent"
      )}
      asChild
    >
      <Link href={item.href} className="flex items-center justify-between">
        <div className="flex items-center">
          <item.icon className="mr-2 h-4 w-4" />
          <span className="truncate">{item.label}</span>
        </div>
        {item.count !== undefined && item.count > 0 && (
          <Badge 
            variant="secondary" 
            className="ml-auto text-xs px-2 min-w-[20px] h-5 flex items-center justify-center rounded-full"
          >
            {item.count}
          </Badge>
        )}
      </Link>
    </Button>
  );

  const NavSection = ({ title, items }: { title: string; items: readonly NavItem[] | NavItem[] }) => (
    <div className="space-y-1">
      <h2 className="px-2 text-xs font-semibold tracking-wide text-muted-foreground">
        {title}
      </h2>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.href} item={item as NavItem} />
        ))}
      </nav>
    </div>
  );

  return (
    <ScrollArea className="h-full">
      <div className="px-2 py-3">
        <div className="space-y-4">
          <NavSection title="Home" items={mainNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="DISCOVER" items={discoverNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="PERSONAL" items={personalNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="TOPICS" items={topics} />

          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="HELP & SETTINGS" items={helpNav} />
        </div>

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
};

export default LeftSidebar;