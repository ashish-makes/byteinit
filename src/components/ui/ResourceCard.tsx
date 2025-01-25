/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
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
import { motion } from "framer-motion";

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
  onBookmarkClick: () => void;
  onDelete?: () => void;
  onEdit?: string;
}

export function ResourceCard({
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
  onBookmarkClick,
  onDelete,
  onEdit,
}: ResourceCardProps) {
  const { isLiked, likes: currentLikes, toggleLike } = useResourceInteractions(id, likes);

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

  return (
    <motion.figure
      className={cn(
        "relative w-full h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-white hover:bg-gray-950/[.05]", // Light mode background
        "dark:border-gray-50/[.1] dark:bg-neutral-900 dark:hover:bg-neutral-800" // Dark mode background
      )}
      // Removed scaling on hover
    >
      {/* Trending Icon */}
      {isTrending && (
        <div className="absolute top-2 left-2 flex items-center justify-center p-1.5 rounded-full bg-orange-500/10">
          <Flame className="size-4 text-orange-500" />
        </div>
      )}

      <div className="flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-950/[.1] dark:bg-gray-50/[.15]">
          <Tag className="size-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <figcaption className="text-sm font-medium dark:text-white truncate">
            {title}
          </figcaption>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
            {category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onBookmarkClick && (
            <motion.button
              onClick={onBookmarkClick}
              className="flex-shrink-0 p-2 hover:bg-gray-950/[.05] dark:hover:bg-gray-50/[.15] rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              {isBookmarked ? (
                <BookmarkX className="size-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Bookmark className="size-5 text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      <blockquote className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">
        {description}
      </blockquote>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-950/[.05] rounded-full dark:bg-gray-50/[.15] dark:text-gray-300"
              // Removed scaling on hover
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
        {user && (
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full">
              {user.image ? (
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={user.name || "User"}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <User2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
            <span className="truncate">{user.name || "Anonymous"}</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {createdAt && (
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 flex-shrink-0" />
                <span className="truncate">{formatDate(createdAt)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Like Button */}
            <motion.button
              onClick={toggleLike}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full",
                "transition-all duration-200 ease-in-out",
                isLiked 
                  ? "text-blue-600 bg-blue-100 dark:text-[#00e5bf] dark:bg-[#00e5bf]/10" 
                  : "text-gray-600 dark:text-gray-300"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? (
                <ThumbsUp 
                  className="size-4 fill-current transform origin-center" 
                  style={{ 
                    animation: 'like-pop 0.3s ease-in-out' 
                  }}
                />
              ) : (
                <ThumbsUpIcon className="size-4" />
              )}
              <span className="text-xs">
                {currentLikes}
              </span>
            </motion.button>

            <motion.a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-full",
                "bg-gray-950/[0.05] dark:bg-gray-50/[0.15]", 
                "hover:bg-gray-950/[0.1] dark:hover:bg-gray-50/[0.2]", 
                "transition-colors"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Open resource"
            >
              <ArrowUpRight className="size-4 text-gray-600 dark:text-gray-300" />
            </motion.a>

            {onEdit && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link
                  href={onEdit}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-950/[.05] dark:bg-gray-50/[.15] hover:bg-gray-950/[.1] dark:hover:bg-gray-50/[.2] transition-colors"
                  aria-label="Edit resource"
                >
                  <Edit className="size-4 text-gray-600 dark:text-gray-300" />
                </Link>
              </motion.div>
            )}

            {onDelete && (
              <motion.button
                onClick={onDelete}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Delete resource"
              >
                <Trash2 className="size-4 text-destructive" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.figure>
  );
}