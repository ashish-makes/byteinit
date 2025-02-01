/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkX,
  CalendarDays,
  Tag,
  User2,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsUpIcon,
  Flame, // Trending icon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { useResourceInteractions } from "@/hooks/useResourceInteractions";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Shadcn UI Tooltip
import { EmojiPicker } from "./EmojiPicker";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  tags?: string[];
  createdAt?: string;
  user?: {
    name?: string;
    image?: string | null;
  };
  isBookmarked: boolean;
  likes?: number;
  saves?: number;
  onBookmarkClick: () => void;
  onDelete?: () => void;
  onEdit?: string;
  reactions?: {
    emoji: string;
    _count: number;
  }[];
  userReactions?: {
    emoji: string;
    userId: string;
  }[];
  loading?: boolean;
}

interface Reaction {
  emoji: string;
  _count: number;
}

interface UserReaction {
  emoji: string;
  userId: string;
}

export const ResourceCard = memo(function ResourceCard({
  id,
  title,
  description,
  url,
  type,
  category,
  tags,
  createdAt,
  user,
  isBookmarked = false,
  likes = 0,
  saves = 0,
  onBookmarkClick,
  onDelete,
  onEdit,
  reactions = [],
  userReactions = [],
  loading = false,
}: ResourceCardProps) {
  const { isLiked, likes: currentLikes, toggleLike } = useResourceInteractions(id, likes);
  const { data: session } = useSession();
  const [currentReactions, setCurrentReactions] = useState<Reaction[]>(reactions || []);
  const [currentUserReactions, setCurrentUserReactions] = useState<UserReaction[]>(userReactions || []);
  const [currentSaves, setCurrentSaves] = useState(saves);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const hoursDifference = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 5) {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    }

    return format(parseISO(dateString), "MMMM dd, yyyy");
  };

  // Check if the post is trending (e.g., more than 50 likes)
  const isTrending = currentLikes > 3;

  const handleReaction = async (emoji: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/resources/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (!response.ok) throw new Error('Failed to toggle reaction');

      const data = await response.json();
      
      // Only update if the data has changed
      if (JSON.stringify(data.reactions) !== JSON.stringify(currentReactions)) {
        setCurrentReactions(data.reactions);
      }
      if (JSON.stringify(data.userReactions) !== JSON.stringify(currentUserReactions)) {
        setCurrentUserReactions(data.userReactions);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // Then, modify the useEffect to only run when props change
  useEffect(() => {
    if (JSON.stringify(reactions) !== JSON.stringify(currentReactions)) {
      setCurrentReactions(reactions || []);
    }
    if (JSON.stringify(userReactions) !== JSON.stringify(currentUserReactions)) {
      setCurrentUserReactions(userReactions || []);
    }
  }, [reactions, userReactions]); // Remove currentReactions and currentUserReactions from deps

  // Similarly for saves
  useEffect(() => {
    if (saves !== currentSaves) {
      setCurrentSaves(saves);
    }
  }, [saves]); // Remove currentSaves from deps

  const handleBookmarkClick = async () => {
    // Optimistic update
    setCurrentSaves(prev => isBookmarked ? prev - 1 : prev + 1);
    
    try {
      await onBookmarkClick();
    } catch (error) {
      // Revert on error
      setCurrentSaves(saves);
      console.error('Error updating bookmark:', error);
    }
  };

  return (
    <motion.figure
      className={cn(
        "relative flex flex-col p-3 rounded-lg border",
        "border-gray-950/[.1] bg-white hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-neutral-900 dark:hover:bg-neutral-800"
      )}
    >
      {/* Header: More compact with smaller icon */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-950/[.1] dark:bg-gray-50/[.15]">
          <Tag className="size-4 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={url} className="group">
            {loading ? (
              <>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </>
            ) : (
              <>
                <figcaption className="text-sm font-medium dark:text-white truncate group-hover:underline">
                  {title}
                </figcaption>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {category}
                </p>
              </>
            )}
          </Link>
        </div>
        <motion.button
          onClick={handleBookmarkClick}
          layout
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
            isBookmarked 
              ? "text-blue-600 bg-blue-100 dark:text-[#00e5bf] dark:bg-[#00e5bf]/10" 
              : "text-gray-600 dark:text-gray-300"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isBookmarked ? { scale: [1, 1.5, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isBookmarked ? (
              <BookmarkX className="size-3 fill-current" />
            ) : (
              <Bookmark className="size-3" />
            )}
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentSaves}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              {currentSaves}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Description: Reduced margin */}
      {loading ? (
        <div className="space-y-1 mb-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <blockquote className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
          {description}
        </blockquote>
      )}

      {/* Tags: Smaller padding and height */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {loading ? (
            <>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </>
          ) : (
            tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-950/[.05] rounded-full dark:bg-gray-50/[.15] dark:text-gray-300"
              >
                {tag}
              </span>
            ))
          )}
        </div>
      )}

      {/* Reactions: Smaller buttons */}
      <LayoutGroup>
        <div className="flex flex-wrap gap-1 mb-2">
          {loading ? (
            <>
              <Skeleton className="h-7 w-12 rounded-full" />
              <Skeleton className="h-7 w-12 rounded-full" />
            </>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {currentReactions?.sort((a, b) => b._count - a._count).map((reaction) => {
                  const isReacted = currentUserReactions?.some(
                    r => r.emoji === reaction.emoji && r.userId === session?.user?.id
                  );
                  
                  return (
                    <motion.div
                      key={reaction.emoji}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 gap-1 px-2 text-sm relative overflow-hidden",
                          "transition-all duration-200",
                          isReacted && "bg-accent"
                        )}
                        onClick={() => handleReaction(reaction.emoji)}
                      >
                        <motion.span 
                          className="inline-block"
                          whileHover={{ scale: 1.3 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {reaction.emoji}
                        </motion.span>
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={reaction._count}
                            className="text-xs"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                          >
                            {reaction._count}
                          </motion.span>
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <EmojiPicker onChange={handleReaction} />
            </>
          )}
        </div>
      </LayoutGroup>

      {/* Footer: Thinner border and reduced padding */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100/50 dark:border-gray-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : (
            user && (
              <div className="flex items-center gap-2">
                <div className="relative h-5 w-5 overflow-hidden rounded-full">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={20}
                      height={20}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <User2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <span className="truncate">{user.name || "Anonymous"}</span>
              </div>
            )
          )}
          {createdAt && (
            <div className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              <span>{formatDate(createdAt)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Move like button back here with animations */}
          <motion.button
            onClick={toggleLike}
            layout
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
              isLiked 
                ? "text-blue-600 bg-blue-100 dark:text-[#00e5bf] dark:bg-[#00e5bf]/10" 
                : "text-gray-600 dark:text-gray-300"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.5, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isLiked ? (
                <ThumbsUp className="size-3 fill-current" />
              ) : (
                <ThumbsUpIcon className="size-3" />
              )}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentLikes}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
              >
                {currentLikes}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          
          {/* Trending Indicator */}
          {isTrending && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 p-1.5 rounded-full bg-orange-500/10">
                    <Flame className="size-4 text-orange-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This post is trending!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Action Buttons: Smaller size */}
          <div className="flex gap-1">
            <motion.a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-950/[0.05] hover:bg-gray-950/[0.1] dark:bg-gray-50/[0.15] dark:hover:bg-gray-50/[0.2]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUpRight className="size-4 text-gray-600 dark:text-gray-300" />
            </motion.a>

            {onEdit && (
              <Link
                href={onEdit}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-950/[.05] hover:bg-gray-950/[.1] dark:bg-gray-50/[.15] dark:hover:bg-gray-50/[.2]"
              >
                <Edit className="size-4 text-gray-600 dark:text-gray-300" />
              </Link>
            )}

            {onDelete && (
              <motion.button
                onClick={onDelete}
                className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-destructive/10 hover:bg-destructive/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="size-4 text-destructive" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.figure>
  );
});