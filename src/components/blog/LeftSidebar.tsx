'use client';

import React from 'react';
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
  Database
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LeftSidebar = () => {
  const pathname = usePathname();
  
  const mainNav = [
    { icon: Home, label: 'Home', href: '/blog' },
    { icon: Flame, label: 'Popular', href: '/blog/popular' },
    { icon: Newspaper, label: 'Latest', href: '/blog/latest' },
    { icon: Sparkles, label: 'Best', href: '/blog/best' },
  ];

  const personalNav = [
    { icon: Bookmark, label: 'Saved', href: '/blog/saved' },
    { icon: History, label: 'History', href: '/blog/history' },
  ];

  const topics = [
    { icon: Code2, label: 'Programming', href: '/blog/topic/programming' },
    { icon: Globe, label: 'Web Dev', href: '/blog/topic/web-dev' },
    { icon: Brain, label: 'AI & ML', href: '/blog/topic/ai-ml' },
    { icon: Cpu, label: 'Systems', href: '/blog/topic/systems' },
    { icon: Smartphone, label: 'Mobile Dev', href: '/blog/topic/mobile' },
    { icon: Cloud, label: 'Cloud', href: '/blog/topic/cloud' },
    { icon: Shield, label: 'Security', href: '/blog/topic/security' },
    { icon: Database, label: 'Databases', href: '/blog/topic/databases' },
  ];

  const NavItem = ({ item }: { item: typeof mainNav[0] }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-8 px-3 text-sm font-medium rounded-lg transition-all duration-200",
        pathname === item.href 
          ? "text-primary font-semibold" 
          : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
      )}
      asChild
    >
      <Link href={item.href}>
        <item.icon className="mr-2 h-4 w-4" />
        <span className="truncate">{item.label}</span>
      </Link>
    </Button>
  );

  const NavSection = ({ 
    title, 
    items 
  }: { 
    title?: string;
    items: typeof mainNav;
  }) => (
    <div className="space-y-1">
      {title && (
        <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 mb-1">
          {title}
        </h4>
      )}
      {items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );

  return (
    <ScrollArea className="h-full">
      <div className="px-2 py-3">
        <div className="space-y-4">
          <NavSection items={mainNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection items={personalNav} />
          
          <Separator className="mx-1 opacity-50" />
          
          <NavSection title="TOPICS" items={topics} />
        </div>

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
};

export default LeftSidebar;