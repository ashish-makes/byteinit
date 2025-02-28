import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, Settings, BookMarked, History, HelpCircle, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { auth } from '@/auth';
import MobileNav from "./MobileNav";
import { SearchBar } from './SearchBar';

const BlogHeader = async () => {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 h-12 border-b bg-background/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-between h-full px-2 gap-2">
        {/* Logo Section - More compact */}
        <div className="flex items-center gap-1.5 min-w-fit">
          <MobileNav />
          <Link href="/blog" className="font-semibold text-sm whitespace-nowrap">
            Byteinit
          </Link>
        </div>

        {/* Search - Compact version */}
        <div className="flex-1 max-w-md mx-auto px-1">
          <SearchBar />
        </div>

        {/* Actions - More compact */}
        <div className="flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {/* Mobile Add Post Button */}
              <Button
                variant="default"
                size="icon"
                className="h-7 w-7 rounded-full sm:hidden"
                asChild
              >
                <Link href="/blog/new">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="sr-only">Create new post</span>
                </Link>
              </Button>

              {/* Desktop Add Post Button */}
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 hidden sm:flex h-7 text-xs"
                asChild
              >
                <Link href="/blog/new">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Post</span>
                </Link>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-full"
                  >
                    <Avatar className="h-7 w-7 cursor-pointer hover:opacity-80 transition">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback>
                        {session.user.name?.[0] || <User className="h-3.5 w-3.5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 mt-1">
                  <DropdownMenuLabel className="flex items-center gap-2 p-2">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-medium leading-none truncate">
                        {session?.user.name}
                      </p>
                      <p className="text-[10px] leading-none text-muted-foreground truncate">
                        {session?.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center text-xs">
                      <User className="mr-2 h-3.5 w-3.5" />
                      Your Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/blog/saved" className="flex items-center text-xs">
                      <BookMarked className="mr-2 h-3.5 w-3.5" />
                      Saved Posts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/blog/history" className="flex items-center text-xs">
                      <History className="mr-2 h-3.5 w-3.5" />
                      History
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center text-xs">
                      <Settings className="mr-2 h-3.5 w-3.5" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center text-xs">
                      <HelpCircle className="mr-2 h-3.5 w-3.5" />
                      Help Center
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="text-red-500 text-xs">
                    <Link href="/api/auth/signout" className="w-full">
                      Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                asChild
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button 
                size="sm"
                className="h-7 px-2 text-xs whitespace-nowrap"
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