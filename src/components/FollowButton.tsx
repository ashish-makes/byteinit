"use client"

import { Button } from "@/components/ui/button"
import { toggleFollow } from "@/lib/actions/follow"
import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  username: string
  isFollowing: boolean
  followerCount: number
}

export function FollowButton({ 
  username, 
  isFollowing: initialIsFollowing,
  followerCount: initialFollowerCount
}: FollowButtonProps) {
  const session = useSession()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [isPending, setIsPending] = useState(false)

  // Make sure to update state when props change
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setFollowerCount(initialFollowerCount);
  }, [initialIsFollowing, initialFollowerCount]);

  // Create a broadcast channel for follower updates
  const broadcastUpdate = useCallback((count: number, isFollowing: boolean) => {
    const channel = new BroadcastChannel('follower-update')
    channel.postMessage({ 
      type: 'FOLLOWER_UPDATE', 
      count,
      isFollowing 
    })
    channel.close()
  }, [])

  const handleFollow = async () => {
    if (!session.data?.user) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      setIsPending(true);
      const newIsFollowing = !isFollowing;
      const newFollowerCount = isFollowing ? followerCount - 1 : followerCount + 1;
      
      // Optimistically update UI
      setIsFollowing(newIsFollowing);
      setFollowerCount(newFollowerCount);
      broadcastUpdate(newFollowerCount, newIsFollowing);

      const result = await toggleFollow(username);
      
      if (result.following !== newIsFollowing) {
        // Revert if server response doesn't match
        setIsFollowing(isFollowing);
        setFollowerCount(followerCount);
        broadcastUpdate(followerCount, isFollowing);
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(isFollowing);
      setFollowerCount(followerCount);
      broadcastUpdate(followerCount, isFollowing);
      toast.error('Failed to update follow status');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={isPending}
      className={cn(
        "h-8 relative overflow-hidden",
        isFollowing && "hover:bg-destructive hover:text-destructive-foreground"
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isFollowing ? "following" : "follow"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isFollowing ? "Following" : "Follow"}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
} 