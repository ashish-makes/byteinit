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
import { auth } from '@/auth';
import MobileNav from "./MobileNav";
import { SearchBar } from './SearchBar';

const BlogHeader = async () => {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-between h-full px-2 sm:px-3 gap-2 sm:gap-3">
        {/* Logo Section */}
        <div className="flex items-center gap-2 min-w-fit">
          <MobileNav />
          <Link href="/blog" className="font-semibold text-base sm:text-lg px-0 sm:px-2 whitespace-nowrap">
            Byteinit
          </Link>
        </div>

        {/* Search - Compact version */}
        <div className="flex-1 max-w-md mx-auto px-2">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isLoggedIn ? (
            <>
              {/* Mobile Add Post Button */}
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full sm:hidden"
                asChild
              >
                <Link href="/blog/new">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Create new post</span>
                </Link>
              </Button>

              {/* Desktop Add Post Button */}
              <Button
                variant="default"
                size="sm"
                className="gap-2 hidden sm:flex"
                asChild
              >
                <Link href="/blog/new">
                  <Plus className="h-4 w-4" />
                  <span>Add Post</span>
                </Link>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback>
                        {session.user.name?.[0] || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <DropdownMenuLabel className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {session?.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {session?.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Mobile-only search option */}
                  <div className="p-2 sm:hidden">
                    <SearchBar />
                  </div>
                  <DropdownMenuSeparator className="sm:hidden" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Your Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/blog/saved" className="flex items-center">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Saved Posts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/blog/history" className="flex items-center">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center">
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
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 sm:h-9 sm:px-4 text-sm"
                asChild
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button 
                size="sm"
                className="h-8 px-2 sm:h-9 sm:px-4 text-sm whitespace-nowrap"
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

export default BlogHeader;