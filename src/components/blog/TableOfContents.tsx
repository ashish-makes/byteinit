'use client'

import { useState } from 'react'
import { ListOrderedIcon, ChevronDownIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface TableOfContentsProps {
  toc: Array<{
    id: string
    text: string
    level: string
  }>
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full border-y bg-muted/20">
      <div className="max-w-[900px] mx-auto px-4 py-4">
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrderedIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider">Contents</span>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                <ChevronDownIcon 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "transform rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-2">
            <nav className="flex flex-col gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                {toc.map((item, index) => {
                  if (
                    index > 0 &&
                    item.level === toc[index - 1].level &&
                    item.level !== 'h2'
                  ) {
                    return null;
                  }

                  const sameHeadings = [item];
                  let nextIndex = index + 1;
                  while (
                    nextIndex < toc.length &&
                    toc[nextIndex].level === item.level
                  ) {
                    sameHeadings.push(toc[nextIndex]);
                    nextIndex++;
                  }

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col gap-1",
                        item.level === "h2" && "col-span-full"
                      )}
                    >
                      {sameHeadings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          data-heading-link
                          className={cn(
                            "group flex items-center hover:text-primary transition-colors",
                            item.level === "h2" 
                              ? "text-sm font-medium" 
                              : "text-[13px] ml-3 text-muted-foreground"
                          )}
                        >
                          <span className="mr-2 h-1 w-1 rounded-full bg-muted-foreground/30 
                            group-hover:bg-primary transition-colors" />
                          <span className="line-clamp-1">{heading.text}</span>
                        </a>
                      ))}
                    </div>
                  );
                })}
              </div>
            </nav>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
} 