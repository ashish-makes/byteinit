import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { 
  Menu, 
  Plus, 
  FileText, 
  FileUp, 
  FolderOpen,
  ExternalLink, 
  Settings, 
  LogOut,
  LayoutGrid,
  PenLine,
  LucideIcon,
  User,
  Copy,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from 'next/link';
import { ThemeToggle } from '../ui/theme-toggle';
import NotificationBell from '@/components/ui/NotificationBell';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "danger";
  className?: string;
  rightElement?: React.ReactNode;
  description?: string;
  iconColor?: string;
}

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProfileUrl = () => {
    const identifier = session?.user?.username || session?.user?.email?.split('@')[0] || '';
    return `/u/${identifier}`;
  };

  const copyProfileUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const profileUrl = `${window.location.origin}${getProfileUrl()}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getPageTitle = () => {
    const path = pathname?.split('/').filter(Boolean);
    if (!path?.length) return 'Dashboard';
    
    // Convert path to title
    const lastSegment = path[path.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const MenuItem = ({ icon: Icon, label, description, href, iconColor = "currentColor" }: MenuItemProps & { href: string }) => (
    <Link href={href} className="block">
      <DropdownMenuItem className={cn(
        "flex items-start gap-3 cursor-pointer rounded-lg",
        "px-3 py-2.5 focus:bg-accent focus:text-accent-foreground",
        "transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none"
      )}>
        <div className={cn(
          "p-2 rounded-md shrink-0",
          "bg-accent/50"
        )}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-[160px]">
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <span className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </span>
          )}
        </div>
      </DropdownMenuItem>
    </Link>
  );

  const UserMenuItem = ({ 
    icon: Icon, 
    label, 
    href, 
    onClick, 
    variant = "default",
    className,
    rightElement 
  }: MenuItemProps) => {
    const content = (
      <div className={cn(
        "flex items-center gap-3 w-full px-3 py-2 text-sm",
        "transition-colors duration-200",
        variant === "danger" ? (
          "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
        ) : (
          "hover:bg-accent/50"
        ),
        className
      )}>
        <Icon className="h-4 w-4" />
        <span className="flex-1">{label}</span>
        {rightElement}
      </div>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }

    return (
      <button className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    );
  };

  const handleCopyProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const profileUrl = `${window.location.origin}${getProfileUrl()}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Profile URL copied",
        description: "Your profile URL has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy profile URL to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-30 w-full",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-b border-border/40",
      "transition-[shadow,border-color] duration-200",
      isScrolled && "shadow-[0_5px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_5px_30px_-15px_rgba(0,0,0,0.3)] border-transparent"
    )}>
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left Section - Page Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden focus:bg-primary/5 rounded-full h-8 w-8"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <h1 className="text-lg font-medium">{getPageTitle()}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Create Button */}
          <TooltipProvider>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      className={cn(
                        "h-9 w-9 rounded-full transition-all duration-200",
                        "dark:bg-white bg-black",
                        "hover:opacity-90",
                        "border-0"
                      )}
                    >
                      <Plus className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        "dark:text-black text-white"
                      )} />
                      <span className="sr-only">Create new</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={8}
                  className={cn(
                    "w-[280px] p-2",
                    "animate-in zoom-in-75 duration-100",
                    "border border-border/50",
                    "bg-background",
                    "shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)]"
                  )}
                >
                  <div className="flex flex-col gap-4">
                    <div className="px-2 py-1.5">
                      <h2 className="text-sm font-medium">Create New</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Select the type of content you want to create
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <MenuItem 
                        icon={FileUp} 
                        label="Resource" 
                        description="Share learning materials, code snippets, and helpful resources with the community" 
                        href="/dashboard/resources/new" 
                        iconColor="#6366f1"
                      />
                      <MenuItem 
                        icon={PenLine} 
                        label="Blog Post" 
                        description="Write an article to share your knowledge and experiences" 
                        href="/dashboard/blog/new" 
                        iconColor="#3b82f6"
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipContent>
                <p>Create new</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          {session && <NotificationBell />}

          <Separator orientation="vertical" className="h-6 mx-1.5" />

          {/* User Menu */}
          {status === 'loading' ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-2 relative h-9 flex items-center gap-2.5 hover:bg-muted/50 rounded-full"
                >
                  <Avatar className="h-7 w-7">
                    {session.user?.image ? (
                      <AvatarImage src={session.user.image} alt={session.user?.name || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm font-medium">{session.user?.name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-60 p-1",
                  "bg-background/95 backdrop-blur-sm",
                  "shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)]",
                  "border border-border/50"
                )}
                sideOffset={8}
              >
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <Avatar className="h-10 w-10">
                    {session.user?.image ? (
                      <AvatarImage src={session.user.image} alt={session.user?.name || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <UserMenuItem 
                  icon={LayoutGrid} 
                  label="Dashboard" 
                  href="/dashboard"
                />
                <UserMenuItem 
                  icon={User} 
                  label="Public Profile" 
                  href={getProfileUrl()}
                  rightElement={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-accent rounded-md shrink-0"
                      onClick={handleCopyProfile}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  }
                />
                <UserMenuItem 
                  icon={FileText} 
                  label="My Articles" 
                  href="/dashboard/blog"
                />
                <UserMenuItem 
                  icon={FolderOpen} 
                  label="My Resources" 
                  href="/dashboard/resources"
                />
                <UserMenuItem 
                  icon={Settings} 
                  label="Settings" 
                  href="/dashboard/profile"
                />

                <DropdownMenuSeparator className="my-1" />

                {/* Theme Toggle */}
                <div 
                  role="button"
                  onClick={() => {
                    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
                    setTheme(next);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 text-sm",
                    "transition-colors duration-200 hover:bg-accent/50 cursor-pointer"
                  )}
                >
                  <div className="relative h-4 w-4">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0 absolute" />
                    <Moon className="h-4 w-4 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100 absolute" />
                  </div>
                  <div className="flex items-center justify-between flex-1">
                    <span>Toggle theme</span>
                    <span className="text-xs text-muted-foreground">
                      {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <UserMenuItem 
                  icon={LogOut} 
                  label="Sign Out" 
                  onClick={() => signOut()}
                  variant="danger"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="default" 
              size="sm"
              className="h-9"
              onClick={() => signIn()}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;