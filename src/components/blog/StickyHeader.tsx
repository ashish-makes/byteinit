'use client'

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  BookmarkIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MessageSquareIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
  LinkIcon,
  Share2Icon
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StickyHeaderProps {
  post: {
    id: string
    title: string
    votes: Array<{ type: 'UP' | 'DOWN' }>
    saves: Array<{ id: string }>
  }
  onVote: (id: string, type: 'UP' | 'DOWN') => Promise<void>
  onSave: (id: string) => Promise<void>
}

export function StickyHeader({ post, onVote, onSave }: StickyHeaderProps) {
  return (
    <div 
      role="banner"
      className="sticky top-14 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
    >
      <div className="flex h-10 items-center px-4 max-w-[900px] mx-auto">
        <h2 className="text-sm font-medium truncate flex-1 mr-4">
          {post.title}
        </h2>

        <div className="flex items-center gap-1.5">
          {/* Vote Buttons with Animation */}
          <div className="flex items-center rounded-full bg-muted/50">
            <form action={() => onVote(post.id, 'UP')}>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "inline-flex items-center justify-center h-8 w-8 rounded-full",
                  post.votes[0]?.type === 'UP' 
                    ? "text-green-500 bg-green-500/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <motion.div
                  animate={post.votes[0]?.type === 'UP' ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </motion.div>
              </motion.button>
            </form>
            
            <AnimatePresence mode="wait">
              <motion.span
                key={post.votes.reduce((acc, vote) => acc + (vote.type === 'UP' ? 1 : -1), 0)}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="w-8 text-center text-sm font-medium"
              >
                {post.votes.reduce((acc, vote) => acc + (vote.type === 'UP' ? 1 : -1), 0)}
              </motion.span>
            </AnimatePresence>

            <form action={() => onVote(post.id, 'DOWN')}>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "inline-flex items-center justify-center h-8 w-8 rounded-full",
                  post.votes[0]?.type === 'DOWN' 
                    ? "text-red-500 bg-red-500/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <motion.div
                  animate={post.votes[0]?.type === 'DOWN' ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </motion.div>
              </motion.button>
            </form>
          </div>

          {/* Comments Button with Animation */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <MessageSquareIcon className="h-4 w-4" />
          </motion.button>

          {/* Save Button with Animation */}
          <form action={() => onSave(post.id)}>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted/50",
                post.saves.length > 0 
                  ? "text-blue-600 bg-blue-100 dark:text-[#00e5bf] dark:bg-[#00e5bf]/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <motion.div
                animate={post.saves.length > 0 ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <BookmarkIcon className={cn(
                  "h-4 w-4",
                  post.saves.length > 0 && "fill-current"
                )} />
              </motion.div>
            </motion.button>
          </form>

          {/* Share Button with Animation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Share2Icon className="h-4 w-4" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem className="gap-2">
                <TwitterIcon className="h-4 w-4" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <LinkedinIcon className="h-4 w-4" />
                Share on LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <FacebookIcon className="h-4 w-4" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 