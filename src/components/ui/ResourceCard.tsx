/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useCallback } from "react";
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
  Flame,
  ExternalLink,
  TrendingUp,
  Code,
  Server,
  Database,
  Shield,
  Smartphone,
  Layers,
  Cloud,
  Cpu,
  Palette,
  Layout,
  BrainCircuit,
  Globe,
  Sparkles,
  Smile,
  Plus,
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
} from "@/components/ui/tooltip";
import { EmojiPicker } from "./EmojiPicker";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";

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
  isOwner?: boolean;
  onLikeClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onReactionUpdate?: (newReactions: Reaction[], newUserReactions: UserReaction[]) => void;
}

interface Reaction {
  emoji: string;
  _count: number;
}

interface UserReaction {
  emoji: string;
  userId: string;
}

// Helper function to get a color based on category
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    FRONTEND: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    BACKEND: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700",
    FULLSTACK: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    DEVOPS: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700",
    MOBILE: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-300 dark:border-pink-700",
    AI_ML: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
    DATABASE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
    SECURITY: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700",
    UI_UX: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-300 dark:border-teal-700",
    DESIGN: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-700",
    MACHINE_LEARNING: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-300 dark:border-violet-700",
    CLOUD: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 border-sky-300 dark:border-sky-700",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300 dark:border-gray-700",
  };
  
  return colors[category] || colors.OTHER;
};

// Helper function to get an icon based on category
const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    FRONTEND: <Code className="h-3 w-3 mr-1" />,
    BACKEND: <Server className="h-3 w-3 mr-1" />,
    FULLSTACK: <Layers className="h-3 w-3 mr-1" />,
    DEVOPS: <Globe className="h-3 w-3 mr-1" />,
    MOBILE: <Smartphone className="h-3 w-3 mr-1" />,
    AI_ML: <BrainCircuit className="h-3 w-3 mr-1" />,
    DATABASE: <Database className="h-3 w-3 mr-1" />,
    SECURITY: <Shield className="h-3 w-3 mr-1" />,
    UI_UX: <Layout className="h-3 w-3 mr-1" />,
    DESIGN: <Palette className="h-3 w-3 mr-1" />,
    MACHINE_LEARNING: <BrainCircuit className="h-3 w-3 mr-1" />,
    CLOUD: <Cloud className="h-3 w-3 mr-1" />,
    OTHER: <Sparkles className="h-3 w-3 mr-1" />,
  };
  
  return icons[category] || icons.OTHER;
};

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
  isOwner = false,
  onLikeClick,
  onEditClick,
  onDeleteClick,
  onReactionUpdate,
}: ResourceCardProps) {
  const { isLiked, likes: currentLikes, toggleLike } = useResourceInteractions(id, likes);
  const { data: session } = useSession();
  const { theme } = useTheme();
  
  const reactionsRef = useRef<Reaction[]>(reactions || []);
  const [currentReactions, setCurrentReactions] = useState<Reaction[]>(reactions || []);
  const [currentUserReactions, setCurrentUserReactions] = useState<UserReaction[]>(userReactions || []);
  const [currentSaves, setCurrentSaves] = useState(saves);
  const [fetchedInitialData, setFetchedInitialData] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeOut" 
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.1)",
      transition: { 
        duration: 0.2,
        ease: "easeOut" 
      }
    }
  };

  // Fetch reactions directly if none are provided or if they're empty
  useEffect(() => {
    const fetchReactions = async () => {
      if ((reactions?.length === 0 || !reactions) && !fetchedInitialData) {
        try {
          setFetchedInitialData(true); // Mark as fetched to prevent multiple calls
          const response = await fetch(`/api/resources/${id}/reactions`);
          if (!response.ok) {
            throw new Error(`Failed to fetch reactions: ${response.status}`);
          }
          const data = await response.json();
          
          if (data.reactions && Array.isArray(data.reactions)) {
            reactionsRef.current = [...data.reactions];
            setCurrentReactions([...data.reactions]);
          }
          
          if (data.userReactions && Array.isArray(data.userReactions)) {
            setCurrentUserReactions([...data.userReactions]);
          }
        } catch (error) {
          console.error('Error fetching reactions:', error);
        }
      }
    };
    
    fetchReactions();
  }, [id, reactions, fetchedInitialData]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    const date = parseISO(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  // Check if the post is trending (e.g., more than 50 likes)
  const isTrending = currentLikes > 3;

  // Format large numbers for badges (e.g., 1500 -> 1.5K, 1500000 -> 1.5M)
  const formatCompactNumber = (num: number): string => {
    if (num === 0) return "0";
    
    if (num < 1000) {
      return num.toString();
    } else if (num < 10000) {
      // 1000-9999: Show as 1K, 2.5K, etc.
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else if (num < 1000000) {
      // 10000-999999: Show as 10K, 100K, 999K
      return Math.floor(num / 1000) + 'K';
    } else if (num < 10000000) {
      // 1000000-9999999: Show as 1.1M, 9.9M
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else {
      // 10000000+: Show as 10M, 100M, etc.
      return Math.floor(num / 1000000) + 'M';
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/resources/${id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Reaction API error:", response.status, errorData);
        throw new Error('Failed to toggle reaction');
      }

      const data = await response.json();
      
      if (data.reactions && Array.isArray(data.reactions)) {
        reactionsRef.current = [...data.reactions];
        setCurrentReactions([...data.reactions]);
        
        // Notify parent component if callback is provided
        if (onReactionUpdate && data.userReactions) {
          onReactionUpdate([...data.reactions], [...data.userReactions]);
        }
      }
      
      if (data.userReactions && Array.isArray(data.userReactions)) {
        setCurrentUserReactions([...data.userReactions]);
      }
      
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // Check if the current user has reacted with a specific emoji
  const hasUserReacted = useCallback((emoji: string) => {
    if (!session?.user?.email) return false;
    return currentUserReactions.some(ur => ur.emoji === emoji && ur.userId === session.user.email);
  }, [session, currentUserReactions]);

  // Update state when props change, with proper comparisons to avoid re-renders
  useEffect(() => {
    // Use JSON.stringify for deep comparison to prevent unnecessary updates
    const reactionsString = JSON.stringify(reactions);
    const currentReactionsString = JSON.stringify(currentReactions);
    
    if (reactions && 
        Array.isArray(reactions) && 
        reactionsString !== currentReactionsString && 
        reactions.length > 0) {  // Only update if we actually have reactions
      reactionsRef.current = [...reactions];
      setCurrentReactions([...reactions]); // Create a new array to ensure re-render
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactions]);
  
  // Same for userReactions
  useEffect(() => {
    const userReactionsString = JSON.stringify(userReactions);
    const currentUserReactionsString = JSON.stringify(currentUserReactions);
    
    if (userReactions && 
        Array.isArray(userReactions) && 
        userReactionsString !== currentUserReactionsString) {
      setCurrentUserReactions([...userReactions]); // Create a new array to ensure re-render
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userReactions]);

  // Similarly for saves - use a deep comparison to avoid unnecessary updates
  useEffect(() => {
    if (saves !== currentSaves) {
      setCurrentSaves(saves);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saves]); // Only depend on saves prop

  const handleSaveClick = async () => {
    // Optimistic update
    setCurrentSaves(prev => isBookmarked ? prev - 1 : prev + 1);
    
    try {
      await onBookmarkClick();
    } catch (error) {
      // Revert on error
      setCurrentSaves(saves);
      console.error('Error updating saved status:', error);
    }
  };

  // Directly access the reactions from the ref for stable display
  const reactionsToDisplay = reactionsRef.current.length > 0 ? reactionsRef.current : currentReactions;
  
  if (loading) {
    // Display a simplified loading state instead of the skeleton
    return (
      <div className="flex flex-col h-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 opacity-40">
        <div className="p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-3"></div>
          <div className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
          <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded mb-1"></div>
          <div className="h-4 w-4/5 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700 mr-2"></div>
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="group flex flex-col h-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-200"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Card Content */}
      <div className="flex flex-col h-full p-4">
        {/* Header with Category and Actions */}
        <div className="flex items-center justify-between mb-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={`/resources/category/${category}`}>
              <Badge 
                variant="outline" 
                className={`text-xs font-medium rounded-full ${getCategoryColor(category)} hover:opacity-90 transition-colors`}
              >
                {getCategoryIcon(category)}
                {category}
              </Badge>
            </Link>
          </motion.div>
          
          {/* Action Buttons - Moved the Like and Save buttons to footer */}
          <div className="flex items-center gap-1.5">
            {/* Emoji Reaction Button */}
            {session && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.1 }}
                            className="flex items-center justify-center h-7 w-7 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <div className="relative flex items-center justify-center">
                              <Smile className="h-3.5 w-3.5 text-primary" />
                            </div>
                          </motion.button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="end">
                          <Picker
                            data={data}
                            onEmojiSelect={(emoji: { native: string }) => {
                              console.log("Emoji selected:", emoji);
                              handleReaction(emoji.native);
                            }}
                            theme={theme === "dark" ? "dark" : "light"}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      {currentReactions.length > 0 && (
                        <span className={cn(
                          "absolute -top-1 -right-1 text-[9px] font-medium rounded-full flex items-center justify-center",
                          "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary-foreground",
                          currentReactions.reduce((sum, r) => sum + r._count, 0) < 100 ? "h-3.5 w-3.5" : "h-3.5 min-w-3.5 px-1"
                        )}>
                          {formatCompactNumber(currentReactions.reduce((sum, r) => sum + r._count, 0))}
                        </span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Add emoji reaction</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Visit Link */}
            <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <Link 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-7 w-7 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Tags Row */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {tags.slice(0, 2).map((tag, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/resources?tag=${tag}`}>
                  <Badge 
                    variant="secondary" 
                    className="text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {tag}
                  </Badge>
                </Link>
              </motion.div>
            ))}
            
            {tags.length > 2 && (
              <Badge variant="secondary" className="text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={url} target="_blank" rel="noopener noreferrer" className="group/title">
          <motion.h3 
            className="text-base font-medium line-clamp-1 mb-2 group-hover/title:text-primary transition-colors"
            style={{ color: isHovered ? 'var(--color-primary)' : '' }}
          >
            {title}
          </motion.h3>
        </Link>
        
        {/* Description */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
          {description}
        </p>
        
        {/* Compact Emoji Reactions Display */}
        {reactionsToDisplay.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <AnimatePresence>
              {reactionsToDisplay.map((reaction, i) => (
                <motion.button 
                  key={`emoji-${reaction.emoji}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.15,
                    delay: i * 0.05,  // Stagger effect
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleReaction(reaction.emoji)}
                  disabled={!session}
                  className={cn(
                    "flex items-center px-1.5 py-0.5 rounded-full border transition-all",
                    hasUserReacted(reaction.emoji) 
                      ? "bg-primary/10 dark:bg-primary/20 border-primary/30" 
                      : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
                  )}
                >
                  <span className="text-sm">{reaction.emoji}</span>
                  <span className="text-[10px] font-medium ml-1 text-neutral-600 dark:text-neutral-400">
                    {formatCompactNumber(reaction._count)}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Metadata Row with User info, date, and interaction buttons */}
        <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex justify-between items-start">
            {/* User info and date - REDESIGNED */}
            <div className="flex flex-col">
              <div className="flex items-center text-xs">
                {user?.image ? (
                  <Avatar className="h-5 w-5 rounded-full mr-1.5">
                    <AvatarImage src={user.image} alt={user.name || ""} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-1.5">
                    <User2 className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
                  </div>
                )}
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{user?.name || "Anonymous"}</span>
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 ml-6">
                <CalendarDays className="h-2.5 w-2.5 inline-block mr-0.5 relative -top-px" />
                {formatDate(createdAt)}
              </div>
            </div>
            
            {/* Interaction buttons - Like and Save moved to footer */}
            <div className="flex items-center gap-1.5">
              {/* Like Button */}
              <div className="relative">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                      isLiked && "text-red-500 hover:text-red-600 dark:hover:text-red-400"
                    )}
                    onClick={toggleLike}
                    disabled={!session}
                  >
                    <motion.div
                      animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </motion.div>
                  </Button>
                </motion.div>
                
                {currentLikes > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 text-[9px] font-medium rounded-full flex items-center justify-center",
                    isLiked 
                      ? "bg-red-100/50 text-red-500 dark:bg-red-500/25 dark:text-red-300" 
                      : "bg-red-100/40 text-red-400 dark:bg-red-500/20 dark:text-red-300",
                    currentLikes < 100 ? "h-3.5 w-3.5" : "h-3.5 min-w-3.5 px-1"
                  )}>
                    {formatCompactNumber(currentLikes)}
                  </span>
                )}
              </div>
              
              {/* Save Button */}
              <div className="relative">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                      isBookmarked && "text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400"
                    )}
                    onClick={handleSaveClick}
                    disabled={!session}
                  >
                    <motion.div
                      animate={isBookmarked ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {isBookmarked ? (
                        <BookmarkX className="h-3.5 w-3.5" />
                      ) : (
                        <Bookmark className="h-3.5 w-3.5" />
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
                
                {currentSaves > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 text-[9px] font-medium rounded-full flex items-center justify-center",
                    isBookmarked 
                      ? "bg-yellow-100/50 text-yellow-500 dark:bg-yellow-500/25 dark:text-yellow-300" 
                      : "bg-yellow-100/40 text-yellow-400 dark:bg-yellow-500/20 dark:text-yellow-300",
                    currentSaves < 100 ? "h-3.5 w-3.5" : "h-3.5 min-w-3.5 px-1"
                  )}>
                    {formatCompactNumber(currentSaves)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});