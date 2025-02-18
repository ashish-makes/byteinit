import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Menu, Plus, Library, User, BookMarked, BarChart, Link2, Settings, FileText, FileUp } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ThemeToggle } from '../ui/theme-toggle';
import { DynamicBreadcrumbs } from '@/components/ui/DynamicBreadcrumbs';
import { NotificationsDropdown } from '@/components/ui/Notification';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { data: session, status } = useSession();

  const getProfileUrl = () => {
    const identifier = session?.user?.username || session?.user?.email?.split('@')[0] || '';
    return `/${identifier}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
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
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Add Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="gap-2 hidden sm:flex"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <Link href="/dashboard/resources/new">
                <DropdownMenuItem className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Add Resource
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/blog/new">
                <DropdownMenuItem className="gap-2">
                  <FileText className="h-4 w-4" />
                  Write Blog Post
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Add Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                className="h-8 w-8 rounded-full p-0 sm:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <Link href="/dashboard/resources/new">
                <DropdownMenuItem className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Add Resource
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/blog/new">
                <DropdownMenuItem className="gap-2">
                  <FileText className="h-4 w-4" />
                  Write Blog Post
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Dropdown or Login Button */}
          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-primary/10" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0 overflow-hidden"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name || 'Profile'}
                      className="object-cover"
                      fill
                      sizes="32px"
                      priority
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="py-2">
                  <p className="text-sm font-medium truncate">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/profile">
                  <DropdownMenuItem className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <Link href={getProfileUrl()}>
                  <DropdownMenuItem className="gap-2">
                    <Link2 className="h-4 w-4" />
                    Public Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/blog/posts">
                  <DropdownMenuItem className="gap-2">
                    <FileText className="h-4 w-4" />
                    My Blog Posts
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="gap-2">
                  <BookMarked className="h-4 w-4" />
                  Saved Resources
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <BarChart className="h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600 gap-2"
                >
                  <User className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => signIn()}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;