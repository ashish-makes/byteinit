'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose,
  SheetTitle 
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Menu,
  X, 
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

const ResourcesMobileNav = () => {
  const pathname = usePathname();
  const savedResourcesCount = useSavedResourcesCount();
  
  const mainNav = [
    { icon: Home, label: 'Home', href: '/resources' },
  ];

  const discoverNav = [
    { icon: Flame, label: 'Trending', href: '/resources/trending' },
    { icon: Newspaper, label: 'Latest', href: '/resources/latest' },
    { icon: Sparkles, label: 'Popular', href: '/resources/popular' },
    { icon: Rocket, label: 'New & Noteworthy', href: '/resources/new' },
  ];

  const personalNav = [
    { 
      icon: Bookmark, 
      label: 'Saved', 
      href: '/resources/bookmarks',
      count: savedResourcesCount 
    }
  ];

  const categories = [
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

  const helpNav = [
    { icon: HelpCircle, label: 'Help Center', href: '/help' },
    { icon: Settings, label: 'Settings', href: '/dashboard/profile' },
  ];

  const NavItem = ({ 
    icon: Icon, 
    label, 
    href, 
    count 
  }: { 
    icon: React.ElementType
    label: string
    href: string
    count?: number 
  }) => (
    <Link href={href} className="w-full">
      <div className={cn(
        "group flex items-center gap-3 px-3 py-2 transition-colors rounded-md",
        pathname === href 
          ? "bg-accent text-accent-foreground font-medium" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}>
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-sm">{label}</span>
        {count !== undefined && count > 0 && (
          <Badge 
            variant="secondary" 
            className="ml-auto text-xs px-2 min-w-[20px] h-5 flex items-center justify-center rounded-full"
          >
            {count}
          </Badge>
        )}
      </div>
    </Link>
  );

  const NavSection = ({ 
    title, 
    items 
  }: { 
    title?: string
    items: Array<{
      icon: React.ElementType
      label: string
      href: string
      count?: number
    }>
  }) => (
    <div className="space-y-1">
      {title && (
        <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 mb-1">
          {title}
        </h4>
      )}
      {items.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-9 w-9 rounded-full hover:bg-accent"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[280px] p-0 [&>button]:hidden"
      >
        <div className="flex items-center h-14 px-4 border-b">
          <Link href="/resources" className="font-semibold tracking-tight">
            ByteInit Resources
          </Link>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 hover:bg-accent/50 rounded-full"
            asChild
          >
            <SheetClose>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-56px)]">
          <div className="p-3 space-y-4">
            {/* Main Navigation */}
            <NavSection items={mainNav} />

            <Separator className="mx-1 opacity-50" />

            {/* Discover Navigation */}
            <NavSection title="DISCOVER" items={discoverNav} />

            <Separator className="mx-1 opacity-50" />

            {/* Personal Navigation */}
            <NavSection title="PERSONAL" items={personalNav} />

            <Separator className="mx-1 opacity-50" />

            {/* Categories Section */}
            <NavSection title="CATEGORIES" items={categories} />

            <Separator className="mx-1 opacity-50" />

            {/* Help & Settings */}
            <NavSection title="HELP & SETTINGS" items={helpNav} />

            {/* Footer */}
            <div className="px-3 py-3 mt-4">
              <p className="text-xs text-muted-foreground">© 2024 ByteInit</p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ResourcesMobileNav; 