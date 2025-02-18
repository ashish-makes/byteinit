"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Search, PlusCircle, User, Settings, BookMarked, History, HelpCircle, Plus, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import MobileNav from "../blog/MobileNav";

const ResourcesHeader = () => {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-between h-full px-3 gap-3">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/resources" className="font-semibold text-lg px-2">
            Resources
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search resources..." 
            className="w-full pl-9 h-9 rounded-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              {/* Mobile Add Resource Button */}
              <Button
                variant="default"
                size="icon"
                className="h-9 w-9 rounded-full sm:hidden bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 text-primary-foreground" />
                <span className="sr-only">Create new resource</span>
              </Button>

              {/* Desktop Add Resource Button */}
              <Button
                variant="default"
                size="sm"
                className="gap-2 hidden sm:flex"
                asChild
              >
                <Link href={'/resources/new'}>
                  <Plus className="h-4 w-4" />
                  Add Resource
                </Link>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback>
                      {session.user.name?.[0] || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <DropdownMenuLabel className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session?.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Your Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resources/my" className="w-full flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Your Resources
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resources/saved" className="w-full flex items-center">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Saved Resources
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resources/history" className="w-full flex items-center">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="w-full flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help Center
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="text-red-500">
                    <Link href="/api/auth/signout" className="w-full">
                      Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!isLoggedIn && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="rounded-full h-9" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button 
                size="sm" 
                className="w-full" 
                asChild
              >
                <Link href="/auth/register">
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ResourcesHeader; 