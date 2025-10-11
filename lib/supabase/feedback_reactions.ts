import { supabase } from "../supabase";

// TypeScript interfaces for the feedback_reactions table
export interface FeedbackReaction {
  id: string;
  feedback_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateFeedbackReactionData {
  feedback_id: string;
  user_id: string;
  is_deleted?: boolean;
}

export interface UpdateFeedbackReactionData {
  is_deleted?: boolean;
  updated_at?: string;
}

export interface FeedbackReactionFilters {
  feedback_id?: string;
  user_id?: string;
  is_deleted?: boolean;
}

// Feedback Reaction CRUD operations
export class FeedbackReactionService {
  // Create a new feedback reaction (heart)
  static async createFeedbackReaction(
    reactionData: CreateFeedbackReactionData
  ): Promise<{ reaction: FeedbackReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_reactions")
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
      console.error("Error creating feedback reaction:", error);
      return { reaction: null, error };
    }
  }

  // Get a feedback reaction by ID
  static async getFeedbackReactionById(
    reactionId: string
  ): Promise<{ reaction: FeedbackReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_reactions")
        .select("*")
        .eq("id", reactionId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      return { reaction: data, error: null };
    } catch (error) {
      console.error("Error fetching feedback reaction:", error);
      return { reaction: null, error };
    }
  }

  // Get feedback reactions with filters
  static async getFeedbackReactions(
    filters?: FeedbackReactionFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    reactions: FeedbackReaction[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("feedback_reactions")
        .select("*", { count: "exact" })
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.feedback_id) {
        query = query.eq("feedback_id", filters.feedback_id);
      }
      if (filters?.user_id) {
        query = query.eq("user_id", filters.user_id);
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
      console.error("Error fetching feedback reactions:", error);
      return { reactions: null, error, count: 0 };
    }
  }

  // Get reactions for a specific feedback post
  static async getFeedbackReactionsByFeedbackId(
    feedbackId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    reactions: FeedbackReaction[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedbackReactions(
      { feedback_id: feedbackId },
      limit,
      offset
    );
  }

  // Get reactions by a specific user
  static async getFeedbackReactionsByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    reactions: FeedbackReaction[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedbackReactions({ user_id: userId }, limit, offset);
  }

  // Get user's reaction to a specific feedback post
  static async getUserFeedbackReaction(
    feedbackId: string,
    userId: string
  ): Promise<{ reaction: FeedbackReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_reactions")
        .select("*")
        .eq("feedback_id", feedbackId)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { reaction: data || null, error: null };
    } catch (error) {
      console.error("Error fetching user feedback reaction:", error);
      return { reaction: null, error };
    }
  }

  // Update a feedback reaction
  static async updateFeedbackReaction(
    reactionId: string,
    updates: UpdateFeedbackReactionData
  ): Promise<{ reaction: FeedbackReaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_reactions")
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
      console.error("Error updating feedback reaction:", error);
      return { reaction: null, error };
    }
  }

  // Soft delete a feedback reaction (set is_deleted to true)
  static async deleteFeedbackReaction(
    reactionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_reactions")
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
      console.error("Error deleting feedback reaction:", error);
      return { success: false, error };
    }
  }

  // Hard delete a feedback reaction (permanent removal)
  static async hardDeleteFeedbackReaction(
    reactionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feedback_reactions")
        .delete()
        .eq("id", reactionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feedback reaction:", error);
      return { success: false, error };
    }
  }

  // Get reaction count for a feedback post
  static async getFeedbackReactionCount(
    feedbackId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback_reactions")
        .select("*", { count: "exact", head: true })
        .eq("feedback_id", feedbackId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting feedback reaction count:", error);
      return { count: 0, error };
    }
  }

  // Check if user has reacted to a feedback post
  static async hasUserReactedToFeedback(
    feedbackId: string,
    userId: string
  ): Promise<{
    hasReacted: boolean;
    error: any;
  }> {
    try {
      const { reaction, error } = await this.getUserFeedbackReaction(
        feedbackId,
        userId
      );

      if (error) throw error;

      return {
        hasReacted: !!reaction,
        error: null,
      };
    } catch (error) {
      console.error("Error checking user reaction to feedback:", error);
      return { hasReacted: false, error };
    }
  }

  // Toggle user reaction to a feedback post (heart/unheart)
  static async toggleUserReaction(
    feedbackId: string,
    userId: string
  ): Promise<{ reaction: FeedbackReaction | null; error: any }> {
    try {
      // Check if user already has a reaction
      const { reaction: existingReaction, error: fetchError } =
        await this.getUserFeedbackReaction(feedbackId, userId);

      if (fetchError) {
        throw fetchError;
      }

      if (existingReaction) {
        // If user already reacted, remove it (soft delete)
        const { success, error } = await this.deleteFeedbackReaction(
          existingReaction.id
        );
        if (error) throw error;
        return { reaction: null, error: null };
      } else {
        // Create new reaction
        return this.createFeedbackReaction({
          feedback_id: feedbackId,
          user_id: userId,
        });
      }
    } catch (error) {
      console.error("Error toggling user reaction:", error);
      return { reaction: null, error };
    }
  }
}

// Admin operations (using service role key)
export class FeedbackReactionAdminService {
  // Force delete a feedback reaction (bypasses RLS)
  static async forceDeleteFeedbackReaction(
    reactionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feedback_reactions")
        .delete()
        .eq("id", reactionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feedback reaction:", error);
      return { success: false, error };
    }
  }

  // Get all feedback reactions as admin (bypasses RLS)
  static async getAllFeedbackReactionsAdmin(): Promise<{
    reactions: FeedbackReaction[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_reactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { reactions: data, error: null };
    } catch (error) {
      console.error("Error fetching all feedback reactions as admin:", error);
      return { reactions: null, error };
    }
  }

  // Get deleted feedback reactions as admin
  static async getDeletedFeedbackReactionsAdmin(): Promise<{
    reactions: FeedbackReaction[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_reactions")
        .select("*")
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return { reactions: data, error: null };
    } catch (error) {
      console.error(
        "Error fetching deleted feedback reactions as admin:",
        error
      );
      return { reactions: null, error };
    }
  }
}

// Export default for convenience
export default FeedbackReactionService;
