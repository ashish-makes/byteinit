import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  BarChart2,
  Bookmark,
  Settings,
  PlusCircle,
  ListPlus,
  Library,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

const Sidebar = ({ className }: { className?: string }) => {
  const primaryNavItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Library, label: 'My Resources', href: '/dashboard/resources' },
    { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Bookmark, label: 'Saved', href: '/dashboard/saved' },
  ];

  const resourceNavItems = [
    { icon: PlusCircle, label: 'Add New Resource', href: '/dashboard/resources/new' },
    { icon: ListPlus, label: 'Manage Resources', href: '/dashboard/resources/manage' },
  ];

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      {/* Logo and Close Button */}
      <div className="h-14 flex items-center justify-between px-4 border-b lg:justify-start lg:gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-primary/10 rounded-lg">
            <Library className="h-5 w-5 text-primary" />
          </div>
          <Link href={'/'} className="font-semibold">Byteinit</Link>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={() => document.dispatchEvent(new CustomEvent('closeSidebar'))}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* Primary Navigation */}
          <div className="space-y-1">
            {primaryNavItems.map((item) => (
              <TooltipProvider key={item.label}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      size="sm"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={20}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <Separator />

          {/* Resource Management */}
          <div>
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
              RESOURCE MANAGEMENT
            </h3>
            <div className="space-y-1">
              {resourceNavItems.map((item) => (
                <TooltipProvider key={item.label}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        size="sm"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={20}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            size="sm"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </Button>
        </div>
      </nav>

      {/* Analytics Summary - Hidden on smaller screens */}
      <div className="border-t p-4 hidden sm:block">
        <div className="rounded-lg bg-primary/10 p-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Resource Analytics</h4>
            <p className="text-xs text-muted-foreground">
              Your resources were viewed 2.4k times this month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;