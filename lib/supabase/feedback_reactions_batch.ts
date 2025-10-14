import { supabase } from "../supabase";

// Interface for the batch response
export interface FeedbackReactionBatch {
  feedbackId: string;
  reactionCount: number;
  userHasReacted: boolean;
}

export interface FeedbackReactionBatchResponse {
  feedback: FeedbackReactionBatch[];
  error: any;
}

// Batch service for feedback reactions
export class FeedbackReactionBatchService {
  // Get reaction counts and user reaction status for multiple feedback posts in a single query
  static async getFeedbackReactionsBatch(
    feedbackIds: string[],
    userId?: string
  ): Promise<FeedbackReactionBatchResponse> {
    try {
      if (feedbackIds.length === 0) {
        return { feedback: [], error: null };
      }

      // Build the query to get all reactions for the specified feedback posts
      let query = supabase
        .from("feedback_reactions")
        .select("feedback_id, user_id")
        .in("feedback_id", feedbackIds)
        .eq("is_deleted", false);

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to create the batch response
      const feedback: FeedbackReactionBatch[] = feedbackIds.map(
        (feedbackId) => {
          // Filter reactions for this specific feedback
          const feedbackReactions =
            data?.filter((reaction) => reaction.feedback_id === feedbackId) ||
            [];

          // Count total reactions
          const reactionCount = feedbackReactions.length;

          // Check if user has reacted (if userId is provided)
          let userHasReacted = false;
          if (userId) {
            userHasReacted = feedbackReactions.some(
              (reaction) => reaction.user_id === userId
            );
          }

          return {
            feedbackId,
            reactionCount,
            userHasReacted,
          };
        }
      );

      return { feedback, error: null };
    } catch (error) {
      console.error("Error getting feedback reactions batch:", error);
      return { feedback: [], error };
    }
  }
}

export default FeedbackReactionBatchService;
