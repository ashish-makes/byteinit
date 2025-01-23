/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Bookmark, BookmarkX, CalendarDays, Tag, User2 } from "lucide-react";
import Image from "next/image";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  category: string;
  tags?: string[]; // Make tags optional
  createdAt?: string;
  author?: {
    name: string;
    image?: string;
  };
  isBookmarked: boolean;
  onBookmarkClick: () => void;
}

export function ResourceCard({
  title,
  description,
  url,
  type,
  category,
  tags,
  createdAt,
  author,
  isBookmarked = false,
  onBookmarkClick,
}: ResourceCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <figure
      className={cn(
        "relative w-full h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border p-4",
        // Light mode styles matching home page with white background
        "border-gray-950/[.1] bg-white hover:bg-gray-950/[.05]",
        // Dark mode styles matching home page
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
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

      <blockquote className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-grow">
        {description}
      </blockquote>

      {/* Tags Section */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`} // Unique key using tag and index
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-950/[.05] rounded-full dark:bg-gray-50/[.15] dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
        {author && (
          <div className="flex items-center gap-2">
            <User2 className="size-4 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              {author.image && (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={20}
                  height={20}
                  className="rounded-full flex-shrink-0"
                />
              )}
              <span className="truncate">{author.name}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          {createdAt && (
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 flex-shrink-0" />
              <span className="truncate">{formatDate(createdAt)}</span>
            </div>
          )}
          
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-950/[.05] dark:bg-gray-50/[.15] hover:bg-gray-950/[.1] dark:hover:bg-gray-50/[.2] transition-colors"
          >
            <ArrowUpRight className="size-4 text-gray-600 dark:text-gray-300" />
          </a>
        </div>
      </div>
    </figure>
  );
}
