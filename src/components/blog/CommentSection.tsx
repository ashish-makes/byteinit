/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Session } from "next-auth"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ReactMarkdown from 'react-markdown'
import { ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import { Loader2 } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Share2, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SmilePlus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Search, SortAsc, X, Clock, History, MessageSquare } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Quote,
  Edit,
  Eye,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react"
import { PlusCircleIcon, MessageSquareIcon } from "lucide-react"

type SortOption = "newest" | "oldest" | "most_reactions" | "most_replies"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
    username: string | null
  }
  reactions: Array<{
    id: string
    emoji: string
    userId: string
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
  replies?: Comment[]
  _count: {
    reactions: number
    replies: number
  }
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  commentCount: number
  session: Session | null
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<{ 
    error?: string, 
    success?: boolean,
    comment?: Comment
  }>
  onDeleteComment?: (commentId: string) => Promise<{ error?: string, success?: boolean }>
  onEditComment?: (commentId: string, content: string) => Promise<{ error?: string, success?: boolean }>
  onAddReaction: (commentId: string, emoji: string) => Promise<{
    error?: string
    reactions?: {
      id: string
      emoji: string
      userId: string
      user: {
        id: string
        name: string | null
        image: string | null
      }
    }[]
    _count?: {
      reactions: number
    }
  }>
}

interface CommentCardProps extends Pick<CommentSectionProps, "session" | "onAddComment" | "onDeleteComment" | "onEditComment" | "onAddReaction"> {
  comment: Comment
  postId: string
  level?: number
  onReaction: (commentId: string, emoji: string) => Promise<void>
}

// Update MarkdownContent component to fix node warnings
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      className="prose prose-sm dark:prose-invert max-w-none break-words"
      components={{
        a: (props) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
        ),
        code: (props) => (
          <code {...props} className="bg-muted px-1.5 py-0.5 rounded text-sm" />
        ),
        p: (props) => (
          <p {...props} className="leading-relaxed" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function getCommentUrl(commentId: string) {
  if (typeof window === 'undefined') return ''
  const baseUrl = window.location.href.split('#')[0] // Remove any existing hash
  return `${baseUrl}#comment-${commentId}`
}

function CommentCard({ 
  comment,
  postId,
  session, 
  onAddComment,
  onDeleteComment,
  onEditComment,
  onAddReaction,
  onReaction,
  level = 0 
}: CommentCardProps) {
  const [isReplying, setIsReplying] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editContent, setEditContent] = React.useState(() => {
    if (typeof window === 'undefined') return comment.content
    const saved = localStorage.getItem(`comment-draft-${comment.id}`)
    return saved || comment.content
  })
  const [showAllReplies, setShowAllReplies] = React.useState(false)
  const commentRef = React.useRef<HTMLDivElement>(null)
  const [isHighlighted, setIsHighlighted] = React.useState(false)
  const [isLinkCopied, setIsLinkCopied] = React.useState(false)
  
  const hasReplies = (comment.replies?.length ?? 0) > 0
  const hasMultipleReplies = (comment.replies?.length ?? 0) > 2
  const firstTwoReplies = comment.replies?.slice(0, 2) ?? []
  const remainingReplies = comment.replies?.slice(2) ?? []
  const remainingCount = remainingReplies.length

  // Handle highlighting when comment is targeted
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === `#comment-${comment.id}`) {
        // Scroll into view
        commentRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        })
        // Highlight the comment
        setIsHighlighted(true)
        // Remove highlight after animation
        setTimeout(() => {
          setIsHighlighted(false)
        }, 2000)
      }
    }

    // Check hash on mount and hash changes
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [comment.id])

  // Save draft when editing
  React.useEffect(() => {
    if (isEditing && editContent !== comment.content) {
      localStorage.setItem(`comment-draft-${comment.id}`, editContent)
    }
  }, [isEditing, editContent, comment.id, comment.content])

  // Clear draft after successful edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await onEditComment?.(comment.id, editContent)
    if (result?.error) {
      toast.error(result.error)
    } else {
      localStorage.removeItem(`comment-draft-${comment.id}`)
      toast.success('Comment updated')
      setIsEditing(false)
    }
  }

  // Add useEffect to reset the copied state
  React.useEffect(() => {
    if (isLinkCopied) {
      const timer = setTimeout(() => setIsLinkCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isLinkCopied])

  // Update the handleUnauthenticatedAction function
  const handleUnauthenticatedAction = () => {
    toast.error("Please sign in to interact with comments")
  }

  return (
    <div 
      ref={commentRef}
      id={`comment-${comment.id}`}
      className={cn(
        "group relative flex gap-2 sm:gap-3 p-2 rounded-md",
        level > 0 && "ml-3 pl-3 sm:ml-5 sm:pl-5",
        level > 1 && "ml-4 sm:ml-8",
        "transition-all duration-300 ease-in-out",
        "hover:bg-muted/30",
        isHighlighted && "highlight"
      )}
    >
      {/* Update connector lines for better mobile display */}
      {level > 0 && (
        <>
          <div className="absolute -left-[1px] sm:-left-[2px] -top-3 bottom-0 w-[1px] sm:w-[2px] bg-border/30" />
          <div 
            className="absolute -left-[1px] sm:-left-[2px] top-[7px] w-3 sm:w-5 h-5 border-l-[1px] sm:border-l-2 border-b-[1px] sm:border-b-2 border-border/30 rounded-bl-xl" 
            style={{ borderLeftColor: 'transparent' }} 
          />
        </>
      )}
      
      <div className="flex-shrink-0 pt-1.5">
        <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
          <AvatarImage src={comment.user.image || ""} />
          <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0 pt-1.5">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-baseline gap-x-2 text-xs sm:text-sm">
              <Link 
                href={`/u/${comment.user.username}`}
                className="font-medium hover:underline line-clamp-1"
              >
                {comment.user.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNowStrict(new Date(comment.createdAt))} ago
              </span>
            </div>
          </div>

          {isEditing ? (
            <form
              className="space-y-2"
              onSubmit={handleEditSubmit}
            >
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-xs text-muted-foreground">
                  Supports Markdown
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">Save</Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-sm">
              <MarkdownContent content={comment.content} />
            </div>
          )}

          {/* Reactions section */}
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.values((comment.reactions || []).reduce((acc, reaction) => {
              // Group reactions by emoji
              const key = reaction.emoji
              if (!acc[key]) {
                acc[key] = {
                  emoji: key,
                  count: 0,
                  users: [],
                  isActive: false
                }
              }
              acc[key].count++
              acc[key].users.push({
                id: reaction.user.id,
                name: reaction.user.name || '',
                image: reaction.user.image
              })
              if (reaction.userId === session?.user?.id) {
                acc[key].isActive = true
              }
              return acc
            }, {} as Record<string, {
              emoji: string
              count: number
              users: Array<{
                id: string
                name: string | null
                image: string | null
              }>
              isActive: boolean
            }>)).map(({ emoji, count, users, isActive }) => (
              <HoverCard key={emoji} openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <ReactionButton
                    emoji={emoji}
                    count={count}
                    isActive={isActive}
                    onToggle={() => onReaction(comment.id, emoji)}
                    session={session}
                  />
                </HoverCardTrigger>
                <HoverCardContent 
                  side="top" 
                  align="start"
                  className="w-48 p-2"
                >
                  <div className="space-y-1">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate">{user.name}</span>
                      </div>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>

          {/* Update action buttons layout */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => session?.user ? setIsReplying(!isReplying) : handleUnauthenticatedAction()}
                className="hover:text-foreground"
              >
                Reply
              </button>
              {session?.user?.id === comment.user.id && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="hover:text-foreground"
                  >
                    Edit
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={async () => {
                            const result = await onDeleteComment?.(comment.id)
                            if (result?.error) {
                              toast.error(result.error)
                            } else {
                              toast.success('Comment deleted')
                            }
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const url = getCommentUrl(comment.id)
                  try {
                    await navigator.clipboard.writeText(url)
                    setIsLinkCopied(true)
                  } catch {
                    toast.error('Failed to copy link')
                  }
                }}
                className="hover:text-foreground flex items-center gap-1"
              >
                {isLinkCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span className="hidden sm:inline">Link copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
              
              <ReactionPicker 
                onReact={(emoji) => session?.user ? onReaction(comment.id, emoji) : handleUnauthenticatedAction()}
                session={session}
              />
            </div>
          </div>
        </div>

        {isReplying && (
          <form 
            className="mt-2 sm:mt-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const textarea = form.querySelector('textarea')
              if (!textarea?.value.trim()) return
              
              const content = textarea.value.trim()
              const result = await onAddComment(postId, content, comment.id)
              
              if (result.error) {
                toast.error(result.error)
              } else if (result.success && result.comment) {
                form.reset()
                setIsReplying(false)
                toast.success('Reply added')
              }
            }}
          >
            <Textarea
              placeholder="What are your thoughts?"
              className="min-h-[80px] sm:min-h-[100px] text-sm"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">Reply</Button>
            </div>
          </form>
        )}

        {/* Replies Section - Updated to handle nested replies */}
        {hasReplies && (
          <div className="mt-3 sm:mt-4">
            {/* Always show first two replies */}
            {firstTwoReplies?.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
                postId={postId}
                session={session}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onEditComment={onEditComment}
                onAddReaction={onAddReaction}
                onReaction={onReaction}
                level={level + 1}
              />
            ))}

            {/* Show remaining replies when expanded */}
            {showAllReplies && remainingReplies?.map(reply => (
              <CommentCard
                key={reply.id}
                comment={reply}
                postId={postId}
                session={session}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onEditComment={onEditComment}
                onAddReaction={onAddReaction}
                onReaction={onReaction}
                level={level + 1}
              />
            ))}

            {/* Show "View more replies" button if there are more replies */}
            {hasMultipleReplies && !showAllReplies && (
              <button
                className="ml-5 mt-2 text-xs text-primary hover:underline flex items-center gap-2"
                onClick={() => setShowAllReplies(true)}
              >
                <ChevronRight className="h-3 w-3" />
                Show {remainingCount} more {remainingCount === 1 ? 'reply' : 'replies'}
              </button>
            )}

            {/* Show "Hide replies" button when expanded */}
            {showAllReplies && hasMultipleReplies && (
              <button
                className="ml-5 mt-2 text-xs text-primary hover:underline"
                onClick={() => setShowAllReplies(false)}
              >
                Hide replies
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const CommentCardSkeleton = ({ level = 0 }: { level?: number }) => (
  <div className={cn(
    "flex gap-3",
    level > 0 && "ml-5 pl-5 relative",
    "pt-0"
  )}>
    {level > 0 && (
      <>
        <div className="absolute -left-[2px] -top-3 bottom-0 w-[2px] bg-border/30" />
        <div 
          className="absolute -left-[2px] top-[7px] w-5 h-5 border-l-2 border-b-2 border-border/30 rounded-bl-xl" 
          style={{ borderLeftColor: 'transparent' }} 
        />
      </>
    )}
    <Skeleton className="h-5 w-5 rounded-full mt-1.5" />
    <div className="flex-1 space-y-2 pt-1.5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
)

const NoComments = () => (
  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-3">
    <div className="relative">
      <MessageSquareIcon className="h-12 w-12 text-muted-foreground/20" />
      <motion.div
        className="absolute -right-1 -top-1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
      >
        <PlusCircleIcon className="h-5 w-5 text-primary" />
      </motion.div>
    </div>
    <div className="space-y-1 max-w-sm">
      <h3 className="font-semibold">No comments yet</h3>
      <p className="text-sm text-muted-foreground">
        Be the first to share your thoughts and start the discussion!
      </p>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Button 
        size="sm" 
        className="rounded-full"
        onClick={() => {
          const textarea = document.querySelector('textarea')
          if (textarea) {
            textarea.focus()
            textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }}
      >
        <MessageSquareIcon className="mr-2 h-4 w-4" />
        Add Comment
      </Button>
    </motion.div>
  </div>
);

export function CommentSection({ 
  postId, 
  comments: initialComments,
  commentCount: initialCommentCount, 
  session,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onAddReaction
}: CommentSectionProps) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments || []);
  const [commentCount, setCommentCount] = React.useState(initialCommentCount || 0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("newest");

  // Update when server data changes
  React.useEffect(() => {
    if (initialComments) {
      setComments(initialComments);
      setCommentCount(initialCommentCount);
    }
  }, [initialComments, initialCommentCount]);

  const handleAddComment = async (postId: string, content: string, parentId?: string) => {
    const result = await onAddComment(postId, content, parentId)
    
    if (result.success && result.comment) {
      setComments(prevComments => {
        if (parentId) {
          // Add reply to existing comment
          return prevComments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), result.comment!],
                _count: {
                  ...comment._count,
                  replies: (comment._count.replies || 0) + 1
                }
              }
            }
            // Also check nested replies
            if (comment.replies?.length) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === parentId) {
                  return {
                    ...reply,
                    replies: [...(reply.replies || []), result.comment!],
                    _count: {
                      ...reply._count,
                      replies: (reply._count.replies || 0) + 1
                    }
                  }
                }
                return reply
              })
              if (JSON.stringify(updatedReplies) !== JSON.stringify(comment.replies)) {
                return {
                  ...comment,
                  replies: updatedReplies
                }
              }
            }
            return comment
          })
        }
        // Add new top-level comment
        return [result.comment!, ...prevComments]
      })
      
      setCommentCount(prev => prev + 1)
    }
    
    return result
  }

  const handleReaction = async (commentId: string, emoji: string) => {
    const result = await onAddReaction(commentId, emoji)
    
    if (!result.error && result.reactions && result._count) {
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              reactions: result.reactions!,
              _count: {
                ...comment._count,
                reactions: result._count!.reactions
              }
            }
          }
          // Also check replies
          if (comment.replies?.length) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  reactions: result.reactions!,
                  _count: {
                    ...reply._count,
                    reactions: result._count!.reactions
                  }
                }
              }
              return reply
            })
            if (JSON.stringify(updatedReplies) !== JSON.stringify(comment.replies)) {
              return {
                ...comment,
                replies: updatedReplies
              }
            }
          }
          return comment
        })
      )
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Discussion ({commentCount})
        </h2>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input with responsive width */}
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search comments..."
              className="pl-8 h-9 w-full sm:w-[200px] lg:w-[250px] focus-visible:ring-1 focus-visible:ring-primary rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Sort dropdown with responsive width */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="h-9 w-full sm:w-[160px] focus-visible:ring-1 focus-visible:ring-primary rounded-full">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">Sort by</span>
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="rounded-lg">
              <SelectItem value="newest" className="text-sm rounded-md">Newest first</SelectItem>
              <SelectItem value="oldest" className="text-sm rounded-md">Oldest first</SelectItem>
              <SelectItem value="most_reactions" className="text-sm rounded-md">Most reactions</SelectItem>
              <SelectItem value="most_replies" className="text-sm rounded-md">Most replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CommentForm
        onSubmit={async (content) => {
          await handleAddComment(postId, content);
        }}
        session={session}
      />

      {comments.length === 0 ? (
        <NoComments />
      ) : (
        <div className="space-y-6">
          {comments
            .filter(comment => 
              comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              comment.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => {
              switch (sortBy) {
                case "newest":
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "most_reactions":
                  return (b.reactions?.length || 0) - (a.reactions?.length || 0);
                case "most_replies":
                  return (b.replies?.length || 0) - (a.replies?.length || 0);
                default:
                  return 0;
              }
            })
            .map(comment => (
              <CommentCard
                key={comment.id}
                comment={comment}
                postId={postId}
                session={session}
                onAddComment={handleAddComment}
                onDeleteComment={onDeleteComment}
                onEditComment={onEditComment}
                onAddReaction={onAddReaction}
                onReaction={handleReaction}
              />
            ))}
        </div>
      )}
    </div>
  )
}

// Update CommentForm for better mobile responsiveness
function CommentForm({ 
  onSubmit, 
  autoFocus = false,
  placeholder = "Add to the discussion",
  buttonText = "Comment",
  defaultValue = "",
  session
}: { 
  onSubmit: (content: string) => Promise<void>
  autoFocus?: boolean
  placeholder?: string
  buttonText?: string
  defaultValue?: string
  session: Session | null
}) {
  const [content, setContent] = React.useState(defaultValue)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  const [showMarkdownHelp, setShowMarkdownHelp] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const maxLength = 5000
  const minLength = 2

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [content])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Submit with Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isSubmitting && content.length >= minLength) {
        e.preventDefault()
        handleSubmit()
      }
      // Toggle preview with Cmd/Ctrl + P
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setShowPreview(!showPreview)
      }
      // Exit preview with Escape
      if (e.key === 'Escape' && showPreview) {
        e.preventDefault()
        setShowPreview(false)
        textareaRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [content, isSubmitting, showPreview])

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting || content.length < minLength) return
    setIsSubmitting(true)
    try {
      await onSubmit(content)
      setContent("")
      setShowPreview(false)
      toast.success("Comment posted successfully!")
    } catch (error) {
      toast.error("Failed to post comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick insert markdown helpers
  const insertMarkdown = (type: 'bold' | 'italic' | 'code' | 'link' | 'quote') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let newText = ''

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        break
      case 'code':
        newText = selectedText.includes('\n') 
          ? `\`\`\`\n${selectedText || 'code'}\n\`\`\``
          : `\`${selectedText || 'code'}\``
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        break
      case 'quote':
        newText = `> ${selectedText || 'quoted text'}`
        break
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)
    
    // Focus and set cursor position after state update
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User avatar"} />
          <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-[20px] border bg-background">
          {showPreview ? (
            <div className="p-3 min-h-[100px] rounded-t-[20px]">
              <MarkdownContent content={content} />
            </div>
          ) : (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder={session?.user ? placeholder : "Please sign in to comment"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!session?.user || isSubmitting}
                className="min-h-[100px] resize-none pr-16 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 focus:outline-none rounded-t-[20px] border-0"
                maxLength={maxLength}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const start = e.currentTarget.selectionStart
                    const end = e.currentTarget.selectionEnd
                    setContent(content.substring(0, start) + '  ' + content.substring(end))
                    setTimeout(() => {
                      e.currentTarget.setSelectionRange(start + 2, start + 2)
                    }, 0)
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                {content.length}/{maxLength}
              </div>
            </div>
          )}
          
          {/* Update toolbar layout with matching border radius */}
          <div className="flex items-center justify-between p-2 sm:p-3 border-t rounded-b-[20px]">
            {/* Left side - Formatting buttons */}
            <div className="flex items-center gap-1">
              <div className="flex items-center rounded-full bg-secondary/50 p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => insertMarkdown('bold')}
                  disabled={!session?.user}
                  title="Bold (Ctrl+B)"
                >
                  <strong>B</strong>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => insertMarkdown('italic')}
                  disabled={!session?.user}
                  title="Italic (Ctrl+I)"
                >
                  <em>I</em>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full font-mono"
                  onClick={() => insertMarkdown('code')}
                  disabled={!session?.user}
                  title="Code (Ctrl+K)"
                >
                  {`<>`}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => insertMarkdown('link')}
                  disabled={!session?.user}
                  title="Link (Ctrl+L)"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => insertMarkdown('quote')}
                  disabled={!session?.user}
                  title="Quote (Ctrl+Q)"
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setShowMarkdownHelp(true)}
                title="Markdown Help"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* Right side - Preview and Submit buttons */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex rounded-full bg-secondary/50 p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  disabled={!session?.user || !content.trim()}
                  className={cn(
                    "rounded-l-full rounded-r-none px-3 h-7",
                    !showPreview && "bg-background"
                  )}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  disabled={!session?.user || !content.trim()}
                  className={cn(
                    "rounded-r-full rounded-l-none px-3 h-7",
                    showPreview && "bg-background"
                  )}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
              {/* Mobile preview toggle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!session?.user || !content.trim()}
                className="sm:hidden h-7 w-7 rounded-full"
                title={showPreview ? "Edit" : "Preview"}
              >
                {showPreview ? (
                  <Edit className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                size="sm"
                disabled={!session?.user || !content.trim() || content.length < minLength || isSubmitting}
                className="h-7 rounded-full px-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  buttonText
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Update info text layout */}
      <div className="text-xs text-muted-foreground pl-8 sm:pl-11 flex flex-wrap gap-2">
        <span>{content.length} characters</span>
        <span className="hidden sm:inline mx-2">•</span>
        <span>Supports Markdown</span>
        <span className="hidden sm:inline mx-2">•</span>
        <span className="hidden sm:inline">Ctrl+Enter to submit</span>
      </div>

      {/* Markdown Help Dialog */}
      <Dialog open={showMarkdownHelp} onOpenChange={setShowMarkdownHelp}>
        <DialogContent className="sm:max-w-[500px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Markdown Formatting Guide</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-2 items-center gap-4">
              <code>**bold**</code>
              <span><strong>bold</strong></span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <code>*italic*</code>
              <span><em>italic</em></span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <code>[link](url)</code>
              <span className="text-primary hover:underline">link</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <code>`code`</code>
              <span><code>code</code></span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <code>&gt; quote</code>
              <span className="border-l-2 border-primary pl-2">quote</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Update ReactionButton component to add animations
function ReactionButton({ 
  emoji, 
  count, 
  isActive, 
  onToggle,
  session 
}: { 
  emoji: string
  count: number
  isActive: boolean
  onToggle: () => void
  session: Session | null
}) {
  const handleClick = () => {
    if (session?.user) {
      onToggle()
    } else {
      toast.error("Please sign in to react")
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition-all duration-200",
        isActive 
          ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/10 dark:hover:bg-primary/20" 
          : "bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
      )}
      aria-label={`${emoji} reaction${isActive ? ' (active)' : ''}`}
      aria-pressed={isActive}
      role="switch"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <motion.span
        initial={{ scale: 1 }}
        animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      >
        {emoji}
      </motion.span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "font-medium",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

// Update ReactionPicker to be more compact
function ReactionPicker({ 
  onReact,
  session
}: { 
  onReact: (emoji: string) => void
  session: Session | null
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  
  // Get the current theme
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  // Update theme based on system/document theme
  React.useEffect(() => {
    // Check if document has .dark class
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setTheme(isDark ? 'dark' : 'light')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          ref={buttonRef}
          className="hover:text-foreground flex items-center gap-1"
          aria-label="Add reaction"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsOpen(true)
            }
          }}
        >
          <SmilePlus className="h-3 w-3" aria-hidden="true" />
          <span>React</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 border-none bg-transparent shadow-none" 
        align="start" 
        sideOffset={5}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="Emoji picker"
      >
        <div className="mt-2">
          <Picker
            data={data}
            onEmojiSelect={(emoji: { native: string }) => {
              if (!session?.user) {
                toast.error("Please sign in to react to comments")
                return
              }
              onReact(emoji.native)
              setIsOpen(false)
              buttonRef.current?.focus()
            }}
            theme={theme}
            previewPosition="none"
            skinTonePosition="none"
            emojiSize={20}
            emojiButtonSize={28}
            maxFrequentRows={2}
            navPosition="bottom"
            perLine={8}
            categories={["people", "nature", "foods", "activity", "places", "objects", "symbols", "flags"]}
            style={{
              // Light mode colors
              ...(theme === 'light' ? {
                '--rgb-accent': '99, 102, 241', // indigo
                '--rgb-background': '255, 255, 255', // white
                '--rgb-input': '243, 244, 246', // gray-100
                '--rgb-color': '0, 0, 0', // black
                '--em-rgb-color': '0, 0, 0',
                '--em-rgb-accent': '99, 102, 241',
                '--em-color-border': 'rgba(0, 0, 0, 0.1)',
                '--em-color-border-over': 'rgba(0, 0, 0, 0.2)',
              } : {
                // Dark mode colors
                '--rgb-accent': '139, 92, 246', // purple
                '--rgb-background': '24, 24, 27', // zinc-900
                '--rgb-input': '39, 39, 42', // zinc-800
                '--rgb-color': '255, 255, 255', // white
                '--em-rgb-color': '255, 255, 255',
                '--em-rgb-accent': '139, 92, 246',
                '--em-color-border': 'rgba(255, 255, 255, 0.1)',
                '--em-color-border-over': 'rgba(255, 255, 255, 0.2)',
              }),
              borderRadius: '0.5rem',
              border: '1px solid var(--em-color-border)',
              backgroundColor: theme === 'light' ? '#ffffff' : '#18181b',
            } as React.CSSProperties}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const CommentSkeleton = () => (
  <div className="space-y-6">
    <CommentCardSkeleton />
    <CommentCardSkeleton level={1} />
    <CommentCardSkeleton />
    <CommentCardSkeleton level={1} />
    <CommentCardSkeleton level={1} />
  </div>
) 