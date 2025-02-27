export const REPUTATION_POINTS = {
  POST_CREATED: 10,        // Creating a post
  POST_VIEWED: 0.1,       // Someone views your post
  POST_LIKED: 5,          // Someone likes your post
  POST_SAVED: 8,          // Someone saves your post
  COMMENT_RECEIVED: 2,    // Someone comments on your post
  POST_VOTE_UP: 10,       // Upvote on post
  POST_VOTE_DOWN: -5,     // Downvote on post
  TRENDING_POST: 50,      // Post appears in trending
} as const;

export const REPUTATION_LEVELS = {
  BEGINNER: { min: 0, max: 99, icon: 'Star', color: "text-zinc-400" },
  INTERMEDIATE: { min: 100, max: 499, icon: 'Medal', color: "text-blue-500" },
  ADVANCED: { min: 500, max: 999, icon: 'Award', color: "text-indigo-500" },
  EXPERT: { min: 1000, max: 4999, icon: 'Trophy', color: "text-amber-500" },
  MASTER: { min: 5000, max: Infinity, icon: 'Trophy', color: "text-yellow-500" }
} as const;

export function calculateReputation(stats: {
  postsCount: number;
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
  totalComments: number;
  upvotes: number;
  downvotes: number;
  trendingPosts: number;
}) {
  return Math.floor(
    stats.postsCount * REPUTATION_POINTS.POST_CREATED +
    stats.totalViews * REPUTATION_POINTS.POST_VIEWED +
    stats.totalLikes * REPUTATION_POINTS.POST_LIKED +
    stats.totalSaves * REPUTATION_POINTS.POST_SAVED +
    stats.totalComments * REPUTATION_POINTS.COMMENT_RECEIVED +
    stats.upvotes * REPUTATION_POINTS.POST_VOTE_UP +
    stats.downvotes * REPUTATION_POINTS.POST_VOTE_DOWN +
    stats.trendingPosts * REPUTATION_POINTS.TRENDING_POST
  );
}