/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  Library,
  X,
  FileText,
  PenSquare,
  PlusCircle,
  ListPlus,
  Settings,
  ChevronDown,
  LogOut,
  Boxes,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

interface NavItem {
  readonly icon: React.ElementType;
  readonly label: string;
  readonly href: string;
  count?: number;
}

interface NavSection {
  readonly id: string;
  readonly title: string;
  readonly items: NavItem[];
}

const Sidebar = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  // Check if the current route is active
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setMounted(true);
    
    // Add event listener for closing sidebar on mobile
    const handleCloseSidebar = () => {
      document.dispatchEvent(new CustomEvent('closeSidebar'));
    };
    
    document.addEventListener('closeSidebar', handleCloseSidebar);
    return () => {
      document.removeEventListener('closeSidebar', handleCloseSidebar);
    };
  }, []);

  if (!mounted) return null;

  const navSections: NavSection[] = [
    {
      id: "home",
      title: "Home",
      items: [
        { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
      ]
    },
    {
      id: "resources",
      title: "Resources",
      items: [
        { icon: PlusCircle, label: 'Add Resource', href: '/dashboard/resources/new' },
        { icon: ListPlus, label: 'Manage Resources', href: '/dashboard/resources/' },
      ]
    },
    {
      id: "blog",
      title: "Blog",
      items: [
        { icon: PenSquare, label: 'Write Blog', href: '/dashboard/blog/new' },
        { icon: FileText, label: 'My Posts', href: '/dashboard/blog' },
      ]
    },
    {
      id: "account",
      title: "Account",
      items: [
        { icon: Settings, label: 'Settings', href: '/dashboard/profile' },
      ]
    }
  ];

  const NavItem = ({ item, isLastItem, isFirstItem }: { 
    item: NavItem; 
    isLastItem: boolean;
    isFirstItem: boolean;
  }) => {
    const isItemActive = isActive(item.href);
    
    return (
      <div className={cn(
        "relative pl-4",
        !isLastItem && "pb-1"
      )}>
        {/* Vertical connector line */}
        <div 
          className={cn(
            "absolute left-0 w-px bg-neutral-800",
            isFirstItem ? "top-0" : "-top-[1px]",
            isLastItem ? "h-[20px]" : "bottom-0"
          )}
        />
        
        {/* Curved connector */}
        <div className="absolute left-0 top-[19px] w-4 h-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 0 0 V 8 H 16" 
              stroke="currentColor" 
              strokeWidth="1" 
              className="text-neutral-800"
              fill="none"
            />
          </svg>
        </div>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-10 text-sm transition-all duration-300",
            "text-neutral-400 hover:text-neutral-200",
            "hover:bg-neutral-800/30 hover:translate-x-1",
            "rounded-lg",
            isItemActive && "text-white font-medium"
          )}
          asChild
        >
          <Link href={item.href} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <item.icon className={cn(
                "h-4 w-4 transition-colors duration-300",
                isItemActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"
              )} />
              <span className="truncate">{item.label}</span>
            </div>
            {item.count !== undefined && item.count > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-auto text-[10px] px-2 min-w-[18px] h-4 flex items-center justify-center rounded-full bg-neutral-800/50 text-white"
              >
                {item.count}
              </Badge>
            )}
          </Link>
        </Button>
      </div>
    );
  };

  // Find the active sections based on current route
  const defaultOpenSections = navSections
    .filter(section => section.items.some(item => isActive(item.href)))
    .map(section => section.id);

  return (
    <div className={cn(
      "flex h-screen flex-col border-r border-neutral-800 bg-black",
      "w-60 relative z-30 dark",
      "after:absolute after:inset-0 after:bg-gradient-to-b after:from-neutral-900/50 after:to-transparent after:pointer-events-none after:h-32 after:z-20",
      className
    )}>
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-neutral-800 relative">
        <Link href="/" className="flex items-center">
          <div className="w-6 h-6 bg-[#FFFFFF] rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <span className="text-[#000000] text-sm font-semibold">B</span>
          </div>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden hover:bg-neutral-800 rounded-full h-7 w-7 ml-auto text-neutral-400 hover:text-neutral-200 transition-colors duration-300"
          onClick={() => document.dispatchEvent(new CustomEvent('closeSidebar'))}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3 px-3">
        <Accordion 
          type="multiple" 
          defaultValue={defaultOpenSections}
          className="space-y-1"
        >
          {navSections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-none relative overflow-hidden"
            >
              <AccordionTrigger 
                className={cn(
                  "py-2 px-4 text-sm font-medium hover:no-underline rounded-lg",
                  "transition-all duration-300 text-neutral-400",
                  "hover:text-neutral-200 hover:bg-neutral-800/20",
                  "data-[state=open]:text-white data-[state=open]:bg-neutral-800/10",
                  "[&>svg]:transition-transform [&>svg]:duration-300"
                )}
              >
                {section.title}
              </AccordionTrigger>
              <AccordionContent 
                className={cn(
                  "pt-2 pb-1 transition-all duration-300",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out",
                  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                )}
              >
                <nav className="relative space-y-0.5">
                  {section.items.map((item, index) => (
                    <NavItem 
                      key={item.href} 
                      item={item} 
                      isLastItem={index === section.items.length - 1}
                      isFirstItem={index === 0}
                    />
                  ))}
                </nav>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="h-8" />
      </ScrollArea>

      {/* Logout Button */}
      <div className="p-3 border-t border-neutral-800">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-11 text-sm transition-all duration-300",
            "text-neutral-400 hover:text-red-400",
            "hover:bg-red-500/10 rounded-lg gap-3",
            "group"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 transition-colors duration-300 group-hover:text-red-400" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;