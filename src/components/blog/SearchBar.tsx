"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle click outside
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative group w-full" ref={searchRef}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search posts..." 
        className="w-full h-9 pl-9 rounded-full bg-muted/50 focus:ring-2 focus:ring-primary/20"
        onClick={() => setIsOpen(true)}
      />
      {/* Dropdown for search suggestions */}
      <div 
        className={cn(
          "search-dropdown absolute w-full mt-1 bg-background border rounded-lg shadow-lg transition-all duration-200 z-50",
          isOpen
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2"
        )}
      >
        <div className="p-3 space-y-3">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Recent Searches</h4>
            <div className="space-y-1">
              {['Next.js Authentication', 'React Server Components', 'TypeScript Tips'].map((search) => (
                <button
                  key={search}
                  className="w-full text-sm px-2 py-1.5 text-left rounded-md hover:bg-accent/50 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Popular Tags</h4>
            <div className="flex flex-wrap gap-1">
              {['nextjs', 'react', 'typescript'].map((tag) => (
                <button
                  key={tag}
                  className="text-xs px-2 py-1 bg-secondary/50 rounded-full hover:bg-secondary/80 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 