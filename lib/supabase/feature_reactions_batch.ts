import { supabase } from "../supabase";
import { ReactionType } from "./feature_reactions";

// Interface for the batch response
export interface FeatureReactionBatch {
  id: string;
  reactions: Record<ReactionType, number>;
  userReaction: ReactionType | null;
}

export interface FeatureReactionBatchResponse {
  features: FeatureReactionBatch[];
  error: any;
}

// Batch service for feature reactions
export class FeatureReactionBatchService {
  // Get reactions and counts for multiple features in a single query
  static async getFeatureReactionsBatch(
    featureIds: string[],
    userId?: string
  ): Promise<FeatureReactionBatchResponse> {
    try {
      if (featureIds.length === 0) {
        return { features: [], error: null };
      }

      // Build the query to get all reactions for the specified features
      let query = supabase
        .from("feature_reactions")
        .select("feature_id, reaction, user_id")
        .in("feature_id", featureIds)
        .eq("is_deleted", false);

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to create the batch response
      const features: FeatureReactionBatch[] = featureIds.map((featureId) => {
        // Filter reactions for this specific feature
        const featureReactions =
          data?.filter((reaction) => reaction.feature_id === featureId) || [];

        // Initialize counts
        const reactions: Record<ReactionType, number> = {
          like: 0,
          dislike: 0,
          love: 0,
          neutral: 0,
        };

        // Count reactions by type
        featureReactions.forEach((reaction) => {
          const reactionType = reaction.reaction as ReactionType;
          if (reactionType in reactions) {
            reactions[reactionType]++;
          }
        });

        // Find user's reaction (if userId is provided)
        let userReaction: ReactionType | null = null;
        if (userId) {
          const userReactionData = featureReactions.find(
            (reaction) => reaction.user_id === userId
          );
          userReaction = (userReactionData?.reaction as ReactionType) || null;
        }

        return {
          id: featureId,
          reactions,
          userReaction,
        };
      });

      return { features, error: null };
    } catch (error) {
      console.error("Error getting feature reactions batch:", error);
      return { features: [], error };
    }
  }

  // Get reactions for all features (useful for initial page load)
  static async getAllFeatureReactionsBatch(
    userId?: string
  ): Promise<FeatureReactionBatchResponse> {
    try {
      // First, get all unique feature IDs from the feature_reactions table
      const { data: featureIdsData, error: featureIdsError } = await supabase
        .from("feature_reactions")
        .select("feature_id")
        .eq("is_deleted", false)
        .not("feature_id", "is", null);

      if (featureIdsError) throw featureIdsError;

      // Extract unique feature IDs
      const uniqueFeatureIds = [
        ...new Set(featureIdsData?.map((row) => row.feature_id) || []),
      ];

      if (uniqueFeatureIds.length === 0) {
        return { features: [], error: null };
      }

      // Use the batch method to get all reactions
      return this.getFeatureReactionsBatch(uniqueFeatureIds, userId);
    } catch (error) {
      console.error("Error getting all feature reactions batch:", error);
      return { features: [], error };
    }
  }
}

export default FeatureReactionBatchService;
