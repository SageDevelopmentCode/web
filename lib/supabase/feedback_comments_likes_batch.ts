import { supabase } from "../supabase";

// Interface for the batch response
export interface FeedbackCommentLikeBatch {
  commentId: string;
  likeCount: number;
  userHasLiked: boolean;
}

export interface FeedbackCommentLikeBatchResponse {
  comments: FeedbackCommentLikeBatch[];
  error: any;
}

// Batch service for feedback comment likes
export class FeedbackCommentLikeBatchService {
  // Get like counts and user like status for multiple comments in a single query
  static async getCommentLikesBatch(
    commentIds: string[],
    userId?: string
  ): Promise<FeedbackCommentLikeBatchResponse> {
    try {
      if (commentIds.length === 0) {
        return { comments: [], error: null };
      }

      // Build the query to get all likes for the specified comments
      let query = supabase
        .from("feedback_comments_likes")
        .select("comment_id, user_id")
        .in("comment_id", commentIds)
        .eq("is_deleted", false);

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to create the batch response
      const comments: FeedbackCommentLikeBatch[] = commentIds.map(
        (commentId) => {
          // Filter likes for this specific comment
          const commentLikes =
            data?.filter((like) => like.comment_id === commentId) || [];

          // Count total likes
          const likeCount = commentLikes.length;

          // Check if user has liked (if userId is provided)
          let userHasLiked = false;
          if (userId) {
            userHasLiked = commentLikes.some((like) => like.user_id === userId);
          }

          return {
            commentId,
            likeCount,
            userHasLiked,
          };
        }
      );

      return { comments, error: null };
    } catch (error) {
      console.error("Error getting comment likes batch:", error);
      return { comments: [], error };
    }
  }
}

export default FeedbackCommentLikeBatchService;
