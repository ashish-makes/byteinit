"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Bookmark, 
  Layout,
  Server,
  Code2,
  Cloud,
  Smartphone,
  Brain,
  Database,
  Shield,
  Palette,
  PenTool,
  Cpu,
  Package,
  Newspaper,
  Flame,
  Sparkles,
  Rocket,
  Settings,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { useSavedResourcesCount } from '@/hooks/useSavedResourcesListener';

interface NavItem {
  readonly icon: React.ElementType;
  readonly label: string;
  readonly href: string;
  count?: number;
}

const LeftSidebar = () => {
  const pathname = usePathname();
  const savedResourcesCount = useSavedResourcesCount();
  
  const mainNav: NavItem[] = [
    { icon: Home, label: 'Home', href: '/resources' },
  ];

  const discoverNav: NavItem[] = [
    { icon: Flame, label: 'Trending', href: '/resources/trending' },
    { icon: Newspaper, label: 'Latest', href: '/resources/latest' },
    { icon: Sparkles, label: 'Popular', href: '/resources/popular' },
    { icon: Rocket, label: 'New & Noteworthy', href: '/resources/new' },
  ];

  const personalNav: NavItem[] = [
    { 
      icon: Bookmark, 
      label: 'Bookmarks', 
      href: '/resources/bookmarks',
      count: savedResourcesCount 
    }
  ];

  // Categories based on the ResourceCategory enum in the schema
  const categories: NavItem[] = [
    { icon: Layout, label: 'Frontend', href: '/resources/category/FRONTEND' },
    { icon: Server, label: 'Backend', href: '/resources/category/BACKEND' },
    { icon: Code2, label: 'Fullstack', href: '/resources/category/FULLSTACK' },
    { icon: Cloud, label: 'DevOps', href: '/resources/category/DEVOPS' },
    { icon: Smartphone, label: 'Mobile', href: '/resources/category/MOBILE' },
    { icon: Brain, label: 'AI & ML', href: '/resources/category/AI_ML' },
    { icon: Database, label: 'Database', href: '/resources/category/DATABASE' },
    { icon: Shield, label: 'Security', href: '/resources/category/SECURITY' },
    { icon: Palette, label: 'UI/UX', href: '/resources/category/UI_UX' },
    { icon: PenTool, label: 'Design', href: '/resources/category/DESIGN' },
    { icon: Cpu, label: 'Machine Learning', href: '/resources/category/MACHINE_LEARNING' },
    { icon: Cloud, label: 'Cloud', href: '/resources/category/CLOUD' },
    { icon: Package, label: 'Other', href: '/resources/category/OTHER' },
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
    }
  ];

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
          <NavSection title="HOME" items={mainNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="DISCOVER" items={discoverNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="PERSONAL" items={personalNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="CATEGORIES" items={categories} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="HELP & SETTINGS" items={helpNav} />
        </div>

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
};

export default LeftSidebar; 