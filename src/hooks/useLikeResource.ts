import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useLikeResource(resourceId: string) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Fetch the initial like status and count
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/resources/${resourceId}/like`, {
          method: 'GET',
        });
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likeCount);
      } catch (error) {
        console.error('Failed to fetch like status:', error);
      }
    };

    fetchLikeStatus();
  }, [resourceId, session]);

  // Toggle the like status
  const toggleLike = async () => {
    if (!session?.user?.id) {
      alert('You must be logged in to like a resource.');
      return;
    }

    try {
      const response = await fetch(`/api/resources/${resourceId}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      setIsLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return { isLiked, likeCount, toggleLike };
}