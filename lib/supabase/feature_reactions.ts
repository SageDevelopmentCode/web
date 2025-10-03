import { supabase } from "../supabase";

// Define reaction types based on your database schema
export type ReactionType = "like" | "dislike" | "love" | "neutral";

// TypeScript interfaces for the feature_reactions table
export interface FeatureReaction {
  id: string;
  feature_id: string;
  user_id: string;
  created_at: string;
  is_deleted: boolean;
  reaction: ReactionType;
  updated_at: string;
}

export interface CreateFeatureReactionData {
  feature_id: string;
  user_id: string;
  reaction: ReactionType;
  is_deleted?: boolean;
}

export interface UpdateFeatureReactionData {
  reaction?: ReactionType;
  is_deleted?: boolean;
  updated_at?: string;
}

export interface FeatureReactionFilters {
  feature_id?: string;
  user_id?: string;
  reaction?: ReactionType;
  is_deleted?: boolean;
}

// Feature Reaction CRUD operations
export class FeatureReactionService {
  // Create a new feature reaction
  static async createFeatureReaction(
    reactionData: CreateFeatureReactionData
  ): Promise<{ reaction: FeatureReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_reactions")
        .insert([
          {
            ...reactionData,
            is_deleted: reactionData.is_deleted ?? false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { reaction: data, error: null };
    } catch (error) {
      console.error("Error creating feature reaction:", error);
      return { reaction: null, error };
    }
  }

  // Get a feature reaction by ID
  static async getFeatureReactionById(
    reactionId: string
  ): Promise<{ reaction: FeatureReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_reactions")
        .select("*")
        .eq("id", reactionId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      return { reaction: data, error: null };
    } catch (error) {
      console.error("Error fetching feature reaction:", error);
      return { reaction: null, error };
    }
  }

  // Get feature reactions with filters
  static async getFeatureReactions(
    filters?: FeatureReactionFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    reactions: FeatureReaction[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("feature_reactions")
        .select("*", { count: "exact" })
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.feature_id) {
        query = query.eq("feature_id", filters.feature_id);
      }
      if (filters?.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters?.reaction) {
        query = query.eq("reaction", filters.reaction);
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { reactions: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching feature reactions:", error);
      return { reactions: null, error, count: 0 };
    }
  }

  // Get reactions for a specific feature
  static async getFeatureReactionsByFeatureId(
    featureId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    reactions: FeatureReaction[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeatureReactions({ feature_id: featureId }, limit, offset);
  }

  // Get reactions by a specific user
  static async getFeatureReactionsByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    reactions: FeatureReaction[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeatureReactions({ user_id: userId }, limit, offset);
  }

  // Get user's reaction to a specific feature
  static async getUserFeatureReaction(
    featureId: string,
    userId: string
  ): Promise<{ reaction: FeatureReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_reactions")
        .select("*")
        .eq("feature_id", featureId)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { reaction: data || null, error: null };
    } catch (error) {
      console.error("Error fetching user feature reaction:", error);
      return { reaction: null, error };
    }
  }

  // Update a feature reaction
  static async updateFeatureReaction(
    reactionId: string,
    updates: UpdateFeatureReactionData
  ): Promise<{ reaction: FeatureReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_reactions")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reactionId)
        .select()
        .single();

      if (error) throw error;
      return { reaction: data, error: null };
    } catch (error) {
      console.error("Error updating feature reaction:", error);
      return { reaction: null, error };
    }
  }

  // Soft delete a feature reaction (set is_deleted to true)
  static async deleteFeatureReaction(
    reactionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_reactions")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reactionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting feature reaction:", error);
      return { success: false, error };
    }
  }

  // Hard delete a feature reaction (permanent removal)
  static async hardDeleteFeatureReaction(
    reactionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feature_reactions")
        .delete()
        .eq("id", reactionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feature reaction:", error);
      return { success: false, error };
    }
  }

  // Get reaction counts for a feature
  static async getFeatureReactionCounts(
    featureId: string
  ): Promise<{ counts: Record<ReactionType, number>; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_reactions")
        .select("reaction")
        .eq("feature_id", featureId)
        .eq("is_deleted", false);

      if (error) throw error;

      const counts: Record<ReactionType, number> = {
        like: 0,
        dislike: 0,
        love: 0,
        neutral: 0,
      };

      data?.forEach((reaction) => {
        const reactionType = reaction.reaction as ReactionType;
        if (reactionType in counts) {
          counts[reactionType]++;
        }
      });

      return { counts, error: null };
    } catch (error) {
      console.error("Error getting feature reaction counts:", error);
      return {
        counts: { like: 0, dislike: 0, love: 0, neutral: 0 },
        error,
      };
    }
  }

  // Check if user has reacted to a feature
  static async hasUserReactedToFeature(
    featureId: string,
    userId: string
  ): Promise<{
    hasReacted: boolean;
    reaction: ReactionType | null;
    error: any;
  }> {
    try {
      const { reaction, error } = await this.getUserFeatureReaction(
        featureId,
        userId
      );

      if (error) throw error;

      return {
        hasReacted: !!reaction,
        reaction: reaction?.reaction || null,
        error: null,
      };
    } catch (error) {
      console.error("Error checking user reaction to feature:", error);
      return { hasReacted: false, reaction: null, error };
    }
  }

  // Toggle or update user reaction to a feature
  static async toggleUserReaction(
    featureId: string,
    userId: string,
    reaction: ReactionType
  ): Promise<{ reaction: FeatureReaction | null; error: any }> {
    try {
      // Check if user already has a reaction
      const { reaction: existingReaction, error: fetchError } =
        await this.getUserFeatureReaction(featureId, userId);

      if (fetchError) {
        throw fetchError;
      }

      if (existingReaction) {
        // If user clicks the same reaction, remove it (soft delete)
        if (existingReaction.reaction === reaction) {
          const { success, error } = await this.deleteFeatureReaction(
            existingReaction.id
          );
          if (error) throw error;
          return { reaction: null, error: null };
        } else {
          // Update to new reaction type
          return this.updateFeatureReaction(existingReaction.id, { reaction });
        }
      } else {
        // Create new reaction
        return this.createFeatureReaction({
          feature_id: featureId,
          user_id: userId,
          reaction,
        });
      }
    } catch (error) {
      console.error("Error toggling user reaction:", error);
      return { reaction: null, error };
    }
  }

  // Get total reaction count for a feature
  static async getTotalReactionCount(
    featureId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feature_reactions")
        .select("*", { count: "exact", head: true })
        .eq("feature_id", featureId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting total reaction count:", error);
      return { count: 0, error };
    }
  }
}

// Admin operations (using service role key)
export class FeatureReactionAdminService {
  // Force delete a feature reaction (bypasses RLS)
  static async forceDeleteFeatureReaction(
    reactionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feature_reactions")
        .delete()
        .eq("id", reactionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feature reaction:", error);
      return { success: false, error };
    }
  }

  // Get all feature reactions as admin (bypasses RLS)
  static async getAllFeatureReactionsAdmin(): Promise<{
    reactions: FeatureReaction[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feature_reactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { reactions: data, error: null };
    } catch (error) {
      console.error("Error fetching all feature reactions as admin:", error);
      return { reactions: null, error };
    }
  }

  // Get deleted feature reactions as admin
  static async getDeletedFeatureReactionsAdmin(): Promise<{
    reactions: FeatureReaction[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feature_reactions")
        .select("*")
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return { reactions: data, error: null };
    } catch (error) {
      console.error(
        "Error fetching deleted feature reactions as admin:",
        error
      );
      return { reactions: null, error };
    }
  }
}

// Export default for convenience
export default FeatureReactionService;
