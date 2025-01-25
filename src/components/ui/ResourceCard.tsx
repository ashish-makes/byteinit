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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { useResourceInteractions } from "@/hooks/useResourceInteractions"; // Adjust import path as needed

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
  const { isLiked, toggleLike } = useResourceInteractions(id);

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

  return (
    <figure
      className={cn(
        "relative w-full h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-white hover:bg-gray-950/[.05]", // Light mode background
        "dark:border-gray-50/[.1] dark:bg-neutral-900 dark:hover:bg-neutral-800" // Dark mode background
      )}
    >
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
            <button
              onClick={onBookmarkClick}
              className="flex-shrink-0 p-2 hover:bg-gray-950/[.05] dark:hover:bg-gray-50/[.15] rounded-full transition-colors"
            >
              {isBookmarked ? (
                <BookmarkX className="size-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Bookmark className="size-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
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
            <button
              onClick={toggleLike}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full transition-colors",
                "hover:bg-gray-950/[.05] dark:hover:bg-gray-50/[.15]",
                isLiked
                  ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              {isLiked ? (
                <ThumbsUp className="size-4 fill-current" />
              ) : (
                <ThumbsUpIcon className="size-4" />
              )}
              <span className="text-xs">{likes}</span>
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-950/[.05] dark:bg-gray-50/[.15] hover:bg-gray-950/[.1] dark:hover:bg-gray-50/[.2] transition-colors"
            >
              <ArrowUpRight className="size-4 text-gray-600 dark:text-gray-300" />
            </a>

            {onEdit && (
              <Link
                href={onEdit}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-950/[.05] dark:bg-gray-50/[.15] hover:bg-gray-950/[.1] dark:hover:bg-gray-50/[.2] transition-colors"
              >
                <Edit className="size-4 text-gray-600 dark:text-gray-300" />
              </Link>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="size-4 text-destructive" />
              </button>
            )}
          </div>
        </div>
      </div>
    </figure>
  );
}