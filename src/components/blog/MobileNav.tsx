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
  Newspaper, 
  Flame, 
  Sparkles, 
  Bookmark,
  Code2,
  Globe,
  Brain,
  Cpu,
  Cloud,
  HelpCircle,
  History,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSavedPosts } from "@/contexts/SavedPostsContext";
import { Badge } from "@/components/ui/badge";

const MobileNav = () => {
  const pathname = usePathname();
  const { savedPosts } = useSavedPosts();
  
  const mainNav = [
    { icon: Home, label: 'Home', href: '/blog' },
    { icon: Flame, label: 'Popular', href: '/blog/popular' },
    { icon: Newspaper, label: 'Latest', href: '/blog/latest' },
    { icon: Sparkles, label: 'Best', href: '/blog/best' },
  ];

  const personalNav = [
    { 
      icon: Bookmark, 
      label: 'Saved', 
      href: '/blog/saved',
      count: savedPosts.size 
    },
    { icon: History, label: 'History', href: '/blog/history' },
  ];

  const topics = [
    { icon: Code2, label: 'Programming', href: '/blog/topic/programming' },
    { icon: Globe, label: 'Web Dev', href: '/blog/topic/web-dev' },
    { icon: Brain, label: 'AI & ML', href: '/blog/topic/ai-ml' },
    { icon: Cpu, label: 'Systems', href: '/blog/topic/systems' },
    { icon: Cloud, label: 'Cloud', href: '/blog/topic/cloud' },
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
          ? "bg-secondary text-secondary-foreground font-medium" 
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
          <Link href="/blog" className="font-semibold tracking-tight">
            ByteInit
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
            <div>
              <div className="space-y-1">
                {mainNav.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Personal Navigation */}
            <div>
              <div className="space-y-1">
                {personalNav.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Topics Section */}
            <div>
              <h3 className="mb-2 px-3 text-xs font-medium text-muted-foreground">TOPICS</h3>
              <div className="space-y-1">
                {topics.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </div>

            <Separator />

            {/* Footer */}
            <div>
              <NavItem icon={HelpCircle} label="Help Center" href="/help" />
              <div className="px-3 py-3 mt-4">
                <p className="text-xs text-muted-foreground">© 2024 ByteInit</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;