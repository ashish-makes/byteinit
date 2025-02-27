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

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
    username: string | null
  }
  reactions: Array<{
    id: string
    userId: string
    commentId: string
    emoji: string
    createdAt: Date
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
  _count: {
    reactions: number
    replies: number
  }
  replies: Comment[]
  parentId: string | null
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
    reactions: Comment['reactions'],
    _count: { reactions: number }
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
  onReaction,
  onAddReaction,
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
  
  const hasReplies = comment.replies?.length > 0
  const hasMultipleReplies = comment.replies?.length > 1
  const firstReply = comment.replies?.[0]
  const remainingReplies = comment.replies?.slice(1)
  const remainingCount = remainingReplies?.length || 0

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
        "group relative flex gap-3 p-2 rounded-md",
        level > 0 && "ml-5 pl-5",
        "transition-all duration-300 ease-in-out",
        "hover:bg-muted/30",
        isHighlighted && "highlight"
      )}
    >
      {/* Continuous line connector */}
      {level > 0 && (
        <>
          {/* Vertical line that extends up */}
          <div className="absolute -left-[2px] -top-3 bottom-0 w-[2px] bg-border/30" />
          {/* Curved connector without gap */}
          <div 
            className="absolute -left-[2px] top-[7px] w-5 h-5 border-l-2 border-b-2 border-border/30 rounded-bl-xl" 
            style={{ borderLeftColor: 'transparent' }} 
          />
        </>
      )}
      
      <div className="flex-shrink-0 pt-1.5">
        <Avatar className="h-5 w-5">
          <AvatarImage src={comment.user.image || ""} />
          <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0 pt-1.5">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-x-2 text-sm">
            <Link 
              href={`/u/${comment.user.username}`}
              className="font-medium hover:underline"
            >
              {comment.user.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNowStrict(new Date(comment.createdAt))} ago
            </span>
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

          {/* Action buttons with emoji icon */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                  Link copied
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3" />
                  Share
                </>
              )}
            </button>
            
            {/* Update ReactionPicker to handle unauthenticated state */}
            <ReactionPicker 
              onReact={(emoji) => session?.user ? onReaction(comment.id, emoji) : handleUnauthenticatedAction()}
              session={session}
            />
          </div>
        </div>

        {isReplying && (
          <form 
            className="mt-3"
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
                // Clear form and close reply box
                form.reset()
                setIsReplying(false)
                toast.success('Reply added')
              }
            }}
          >
            <Textarea
              placeholder="What are your thoughts?"
              className="min-h-[100px] text-sm"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">Reply</Button>
            </div>
          </form>
        )}

        {/* Replies Section */}
        {hasReplies && (
          <div className="mt-4">
            {/* Always show first reply */}
            {firstReply && (
              <CommentCard
                key={firstReply.id}
                comment={firstReply}
                postId={postId}
                session={session}
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment}
                onEditComment={onEditComment}
                onReaction={onReaction}
                onAddReaction={onAddReaction}
                level={level + 1}
              />
            )}

            {/* Show "View more replies" button if there are more replies */}
            {hasMultipleReplies && !showAllReplies && (
              <button
                className="ml-5 mt-2 text-xs text-primary hover:underline flex items-center gap-2"
                onClick={() => setShowAllReplies(true)}
              >
                <div className="relative w-4 h-4">
                  <div className="absolute left-0 top-1/2 w-3 h-[2px] bg-border/30" />
                  <div className="absolute left-0 top-0 w-[2px] h-4 bg-border/30" />
                </div>
                <span className="text-muted-foreground flex items-center gap-1">
                  {remainingCount} replies
                  <ChevronRight className="h-3 w-3" />
                </span>
              </button>
            )}

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
                onReaction={onReaction}
                onAddReaction={onAddReaction}
                level={level + 1}
              />
            ))}

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

type SortOption = 'newest' | 'oldest' | 'most_replies'

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
  const [isLoading, setIsLoading] = React.useState(true)
  const [sortBy, setSortBy] = React.useState<SortOption>('newest')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [comments, setComments] = React.useState(
    // Initialize with reactions from initial comments
    initialComments.map(comment => ({
      ...comment,
      reactions: comment.reactions || [],
      _count: comment._count || { reactions: 0 }
    }))
  )
  const [commentCount, setCommentCount] = React.useState(initialCommentCount)
  
  React.useEffect(() => {
    // Simulate loading for smoother transition
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Sort comments
  const sortedRootComments = React.useMemo(() => {
    // Filter out any undefined or malformed comments
    const validComments = comments.filter((comment): comment is Comment => 
      comment !== undefined && comment !== null
    )
    
    const rootComments = validComments.filter(comment => !comment.parentId)
    return rootComments.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'most_replies':
          return ((b.replies?.length || 0) - (a.replies?.length || 0))
        default:
          return 0
      }
    })
  }, [comments, sortBy])

  const filteredComments = React.useMemo(() => {
    if (!searchTerm) return sortedRootComments
    
    return sortedRootComments.filter(comment => 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [sortedRootComments, searchTerm])

  // Update handleReaction function
  const handleReaction = async (commentId: string, emoji: string) => {
    if (!session?.user?.id || !session?.user?.name) {
      toast.error("Please sign in to react")
      return
    }

    // Store the previous state for rollback
    const previousComments = comments

    try {
      // Single optimistic update
      setComments(prevComments => 
        prevComments.map(comment => {
          const updateReactions = (reactions: typeof comment.reactions = []) => {
            const hasReaction = reactions.some(
              r => r.emoji === emoji && r.userId === session.user.id
            )
            
            return hasReaction
              ? reactions.filter(r => !(r.emoji === emoji && r.userId === session.user.id))
              : [
                  ...reactions,
                  {
                    id: `temp-${Date.now()}`,
                    emoji,
                    userId: session.user.id,
                    commentId,
                    createdAt: new Date(),
                    user: {
                      id: session.user.id,
                      name: session.user.name || 'Anonymous',
                      image: session.user.image || null
                    }
                  }
                ]
          }

          if (comment.id === commentId) {
            const updatedReactions = updateReactions(comment.reactions || [])
            return {
              ...comment,
              reactions: updatedReactions,
              _count: {
                ...comment._count,
                reactions: updatedReactions.length
              }
            }
          }
          
          if (comment.replies?.length) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      reactions: updateReactions(reply.reactions || [])
                    }
                  : reply
              )
            }
          }
          return comment
        })
      )

      // Make API call in background
      await onAddReaction(commentId, emoji)
    } catch (error) {
      // Rollback to previous state on error
      setComments(previousComments)
      console.error('Reaction error:', error)
      toast.error('Failed to add reaction')
    }
  }

  // Add this effect to keep comments in sync with initialComments
  React.useEffect(() => {
    setComments(initialComments)
  }, [initialComments])

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="max-w-[900px] mx-auto space-y-4">
          <h2 className="text-lg font-semibold">Discussion ({commentCount})</h2>
          <div className="space-y-0">
            <CommentCardSkeleton />
            <CommentCardSkeleton level={1} />
            <CommentCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8" id="comments">
      <div className="max-w-[900px] mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold truncate">
            Discussion ({commentCount})
          </h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full sm:w-[200px] pl-8 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Clear search</span>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm">
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sort by:</span>
                  <span className="font-medium">{sortBy.replace('_', ' ')}</span>
                </div>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="newest" className="text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Newest first
                  </div>
                </SelectItem>
                <SelectItem value="oldest" className="text-sm">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Oldest first
                  </div>
                </SelectItem>
                <SelectItem value="most_replies" className="text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Most replies
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add this after the search/sort section to show search results */}
        {searchTerm && (
          <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {filteredComments.length === 0 ? (
                'No comments found'
              ) : (
                <>
                  Found {filteredComments.length} comment{filteredComments.length === 1 ? '' : 's'} 
                  matching "<span className="font-medium text-foreground">{searchTerm}</span>"
                </>
              )}
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchTerm('')}
              className="h-auto p-0 text-sm font-normal"
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Comment Form */}
        {session?.user ? (
          <div className="mb-8">
            <CommentForm
              session={session}
              onSubmit={async (content) => {
                const result = await onAddComment(postId, content)
                if (result.error) {
                  toast.error(result.error)
                } else if (result.success && result.comment) {
                  toast.success('Comment added successfully')
                }
              }}
            />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex flex-col gap-4 rounded-lg border bg-background">
              <div className="flex gap-3 p-4">
                <div className="flex-shrink-0 pt-1.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="What are your thoughts?"
                    className="min-h-[100px] cursor-not-allowed resize-none opacity-60"
                    disabled
                  />
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Sign in to join the discussion
                    </p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href="/signup">Sign up</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-0">
          {filteredComments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              session={session}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onEditComment={onEditComment}
              onReaction={handleReaction}
              onAddReaction={onAddReaction}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Update CommentForm with keyboard shortcuts
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const maxLength = 500

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Submit with Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isSubmitting && content.trim()) {
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

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit(content)
      setContent("")
      setShowPreview(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="flex flex-col gap-4"
      role="form"
      aria-label="Comment form"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User avatar"} />
          <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-lg border bg-background">
          <div 
            className="flex gap-2 p-2 border-b"
            role="toolbar"
            aria-label="Comment mode"
          >
            <Button 
              size="sm" 
              variant={showPreview ? "outline" : "default"}
              onClick={() => {
                setShowPreview(false)
                textareaRef.current?.focus()
              }}
              aria-pressed={!showPreview}
              aria-label="Write mode"
            >
              Write
            </Button>
            <Button 
              size="sm"
              variant={showPreview ? "default" : "outline"}
              onClick={() => setShowPreview(true)}
              aria-pressed={showPreview}
              aria-label="Preview mode"
            >
              Preview
            </Button>
          </div>

          {showPreview ? (
            <div 
              className="min-h-[100px] p-3"
              role="region"
              aria-label="Comment preview"
              tabIndex={0}
            >
              <MarkdownContent content={content} />
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus={autoFocus}
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Comment content"
              maxLength={maxLength}
            />
          )}

          <div className="flex items-center justify-between p-3 border-t">
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">
                Supports Markdown (<kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border rounded-md">
                  {navigator?.platform?.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'} + P
                </kbd> to preview)
              </p>
              <p 
                className={cn(
                  "text-xs",
                  content.length > maxLength 
                    ? "text-destructive" 
                    : "text-muted-foreground"
                )}
                role="status"
                aria-live="polite"
              >
                {content.length}/{maxLength} characters
              </p>
            </div>
            <Button 
              size="sm"
              disabled={!content.trim() || isSubmitting || content.length > maxLength}
              onClick={handleSubmit}
              aria-label={isSubmitting ? "Submitting comment..." : "Submit comment"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Submitting...
                </>
              ) : buttonText}
            </Button>
          </div>
        </div>
      </div>
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
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition-all duration-200",
        isActive 
          ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/10 dark:hover:bg-primary/20" 
          : "bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
      )}
      onClick={() => session?.user ? onToggle() : toast.error("Please sign in to react")}
      aria-label={`${emoji} reaction${isActive ? ' (active)' : ''}`}
      aria-pressed={isActive}
      role="switch"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          session?.user ? onToggle() : toast.error("Please sign in to react")
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