import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { 
  Menu, 
  Plus, 
  Library, 
  User, 
  Bookmark, 
  FolderOpen,
  ExternalLink, 
  Settings, 
  FileText, 
  FileUp, 
  BellRing,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  PenLine,
  LucideIcon,
  Copy,
  CheckCheck
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ThemeToggle } from '../ui/theme-toggle';
import { DynamicBreadcrumbs } from '@/components/ui/DynamicBreadcrumbs';
import NotificationBell from '@/components/ui/NotificationBell';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  href: string;
  iconColor?: string;
}

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);

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

  const MenuItem = ({ icon: Icon, label, description, href, iconColor = "currentColor" }: MenuItemProps) => (
    <Link href={href}>
      <DropdownMenuItem className="gap-2 cursor-pointer py-2">
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
        <div className="flex flex-col">
          <span>{label}</span>
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      </DropdownMenuItem>
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo (Visible only on mobile) */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="p-1 bg-primary/10 rounded-lg">
              <Library className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold">Byteinit</span>
          </Link>

          {/* Breadcrumbs (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <DynamicBreadcrumbs />
          </div>
        </div>

        {/* Right Side: Actions and User Menu */}
        <div className="flex items-center gap-1">
          {/* Desktop Create Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary/90 to-primary"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <MenuItem 
                  icon={FileUp} 
                  label="Resource" 
                  description="Upload learning materials" 
                  href="/dashboard/resources/new" 
                  iconColor="#6366f1"
                />
                <MenuItem 
                  icon={PenLine} 
                  label="Blog Post" 
                  description="Write an article" 
                  href="/dashboard/blog/new" 
                  iconColor="#3b82f6"
                />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Create Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-9 w-9 rounded-full p-0 sm:hidden bg-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <MenuItem 
                icon={FileUp} 
                label="Resource" 
                description="Upload learning materials" 
                href="/dashboard/resources/new" 
                iconColor="#6366f1"
              />
              <MenuItem 
                icon={PenLine} 
                label="Blog Post" 
                description="Write an article" 
                href="/dashboard/blog/new" 
                iconColor="#3b82f6"
              />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          {session && (
            <NotificationBell />
          )}

          {/* Separator */}
          <Separator orientation="vertical" className="h-6 hidden sm:block mx-1" />
          
          {/* User Dropdown or Login Button */}
          {status === 'loading' ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-primary/10" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-2 relative rounded-full h-9 flex items-center gap-2"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    {session.user?.image ? (
                      <AvatarImage src={session.user.image} alt={session.user?.name || 'Profile'} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[100px]">{session.user?.email?.split('@')[0]}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-border">
                      {session.user?.image ? (
                        <AvatarImage src={session.user.image} alt={session.user?.name || 'Profile'} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background"></span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <MenuItem 
                    icon={LayoutDashboard} 
                    label="Dashboard" 
                    href="/dashboard" 
                  />
                  <div className="relative">
                    <Link href={getProfileUrl()}>
                      <DropdownMenuItem className="gap-2 cursor-pointer py-2 pr-10">
                        <ExternalLink className="h-4 w-4" />
                        <span>Public Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={copyProfileUrl}
                    >
                      {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 opacity-70" />}
                    </Button>
                  </div>
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <MenuItem 
                    icon={FileText} 
                    label="My Articles" 
                    href="/dashboard/blog" 
                  />
                  <MenuItem 
                    icon={FolderOpen} 
                    label="My Resources" 
                    href="/dashboard/resources" 
                  />
                </DropdownMenuGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <MenuItem 
                    icon={Settings} 
                    label="Settings" 
                    href="/dashboard/profile" 
                  />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="gap-2 text-red-600 cursor-pointer focus:text-red-600 py-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <div>Logout</div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;