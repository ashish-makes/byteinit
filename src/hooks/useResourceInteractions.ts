import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface ResourceInteractionsHook {
  isLiked: boolean;
  likes: number;
  toggleLike: () => Promise<void>;
  recordView: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useResourceInteractions(
  resourceId: string, 
  initialLikes: number = 0
): ResourceInteractionsHook {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial like status
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/resources/${resourceId}/like`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch like status');
        }

        const data = await response.json();
        setIsLiked(data.liked);
        // Update likes count from initial fetch
        if (data.likes !== undefined) {
          setLikes(data.likes);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    checkLikeStatus();
  }, [resourceId, session]);

  // Optimized toggle like functionality
  const toggleLike = useCallback(async () => {
    if (!session?.user) return;

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikes(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/resources/${resourceId}/like`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Revert optimistic update if request fails
        setIsLiked(wasLiked);
        setLikes(prev => wasLiked ? prev + 1 : prev - 1);
        throw new Error('Failed to toggle like');
      }

      // Parse response to get updated like count
      const data = await response.json();
      if (data.likes !== undefined) {
        setLikes(data.likes);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  }, [resourceId, session, isLiked]);

  // Record view functionality
  const recordView = useCallback(async () => {
    if (!session?.user) return;

    try {
      await fetch(`/api/resources/${resourceId}/view`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  }, [resourceId, session]);

  return {
    isLiked,
    likes,
    toggleLike,
    recordView,
    isLoading,
    error
  };
}