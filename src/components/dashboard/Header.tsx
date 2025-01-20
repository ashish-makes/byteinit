import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Menu, Plus, Library, User, Settings, BookMarked, BarChart } from 'lucide-react';
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

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="p-1 bg-primary/10 rounded-lg">
            <Library className="h-5 w-5 text-primary" />
          </div>
          <Link href={'/'} className="font-semibold">Byteinit</Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="default"
            className="h-7 w-7 rounded-full p-0 sm:hidden"
            onClick={() => (window.location.href = '/dashboard/resources/new')}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          <Button className="gap-2 hidden sm:flex" size="sm">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>

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
                  <p className="text-sm font-medium truncate">{session.user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <BookMarked className="h-4 w-4" />
                  Saved Resources
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <BarChart className="h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
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