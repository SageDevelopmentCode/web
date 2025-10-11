import { supabase } from "../supabase";

// TypeScript interfaces for the feedback_comments_likes table
export interface FeedbackCommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateFeedbackCommentLikeData {
  comment_id: string;
  user_id: string;
  is_deleted?: boolean;
}

export interface UpdateFeedbackCommentLikeData {
  is_deleted?: boolean;
  updated_at?: string;
}

export interface FeedbackCommentLikeFilters {
  comment_id?: string;
  user_id?: string;
  is_deleted?: boolean;
}

// Feedback Comment Like CRUD operations
export class FeedbackCommentLikeService {
  // Create a new feedback comment like
  static async createFeedbackCommentLike(
    likeData: CreateFeedbackCommentLikeData
  ): Promise<{ like: FeedbackCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments_likes")
        .insert([
          {
            ...likeData,
            is_deleted: likeData.is_deleted ?? false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { like: data, error: null };
    } catch (error) {
      console.error("Error creating feedback comment like:", error);
      return { like: null, error };
    }
  }

  // Get a feedback comment like by ID
  static async getFeedbackCommentLikeById(
    likeId: string
  ): Promise<{ like: FeedbackCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments_likes")
        .select("*")
        .eq("id", likeId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      return { like: data, error: null };
    } catch (error) {
      console.error("Error fetching feedback comment like:", error);
      return { like: null, error };
    }
  }

  // Get feedback comment likes with filters
  static async getFeedbackCommentLikes(
    filters?: FeedbackCommentLikeFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    likes: FeedbackCommentLike[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("feedback_comments_likes")
        .select("*", { count: "exact" })
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.comment_id) {
        query = query.eq("comment_id", filters.comment_id);
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
      return { likes: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching feedback comment likes:", error);
      return { likes: null, error, count: 0 };
    }
  }

  // Get likes for a specific comment
  static async getCommentLikes(
    commentId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    likes: FeedbackCommentLike[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedbackCommentLikes(
      { comment_id: commentId },
      limit,
      offset
    );
  }

  // Get likes by a specific user
  static async getFeedbackCommentLikesByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    likes: FeedbackCommentLike[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedbackCommentLikes({ user_id: userId }, limit, offset);
  }

  // Get user's like for a specific comment
  static async getUserCommentLike(
    commentId: string,
    userId: string
  ): Promise<{ like: FeedbackCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments_likes")
        .select("*")
        .eq("comment_id", commentId)
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { like: data || null, error: null };
    } catch (error) {
      console.error("Error fetching user comment like:", error);
      return { like: null, error };
    }
  }

  // Update a feedback comment like
  static async updateFeedbackCommentLike(
    likeId: string,
    updates: UpdateFeedbackCommentLikeData
  ): Promise<{ like: FeedbackCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments_likes")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", likeId)
        .select()
        .single();

      if (error) throw error;
      return { like: data, error: null };
    } catch (error) {
      console.error("Error updating feedback comment like:", error);
      return { like: null, error };
    }
  }

  // Soft delete a feedback comment like (set is_deleted to true)
  static async deleteFeedbackCommentLike(
    likeId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments_likes")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", likeId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting feedback comment like:", error);
      return { success: false, error };
    }
  }

  // Hard delete a feedback comment like (permanent removal)
  static async hardDeleteFeedbackCommentLike(
    likeId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feedback_comments_likes")
        .delete()
        .eq("id", likeId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feedback comment like:", error);
      return { success: false, error };
    }
  }

  // Toggle user like on a comment
  static async toggleUserCommentLike(
    commentId: string,
    userId: string
  ): Promise<{ like: FeedbackCommentLike | null; error: any }> {
    try {
      // Check if user already has a like
      const { like: existingLike, error: fetchError } =
        await this.getUserCommentLike(commentId, userId);

      if (fetchError) {
        throw fetchError;
      }

      if (existingLike) {
        // If user already liked, remove it (soft delete)
        const { success, error } = await this.deleteFeedbackCommentLike(
          existingLike.id
        );
        if (error) throw error;
        return { like: null, error: null };
      } else {
        // Create new like
        return this.createFeedbackCommentLike({
          comment_id: commentId,
          user_id: userId,
        });
      }
    } catch (error) {
      console.error("Error toggling user comment like:", error);
      return { like: null, error };
    }
  }

  // Get like count for a specific comment
  static async getCommentLikeCount(
    commentId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback_comments_likes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting comment like count:", error);
      return { count: 0, error };
    }
  }

  // Check if user has liked a comment
  static async hasUserLikedComment(
    commentId: string,
    userId: string
  ): Promise<{
    hasLiked: boolean;
    error: any;
  }> {
    try {
      const { like, error } = await this.getUserCommentLike(commentId, userId);

      if (error) throw error;

      return {
        hasLiked: !!like,
        error: null,
      };
    } catch (error) {
      console.error("Error checking user comment like:", error);
      return { hasLiked: false, error };
    }
  }
}

// Admin operations (using service role key)
export class FeedbackCommentLikeAdminService {
  // Force delete a feedback comment like (bypasses RLS)
  static async forceDeleteFeedbackCommentLike(
    likeId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feedback_comments_likes")
        .delete()
        .eq("id", likeId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feedback comment like:", error);
      return { success: false, error };
    }
  }

  // Get all feedback comment likes as admin (bypasses RLS)
  static async getAllFeedbackCommentLikesAdmin(): Promise<{
    likes: FeedbackCommentLike[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_comments_likes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { likes: data, error: null };
    } catch (error) {
      console.error(
        "Error fetching all feedback comment likes as admin:",
        error
      );
      return { likes: null, error };
    }
  }

  // Get deleted feedback comment likes as admin
  static async getDeletedFeedbackCommentLikesAdmin(): Promise<{
    likes: FeedbackCommentLike[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_comments_likes")
        .select("*")
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return { likes: data, error: null };
    } catch (error) {
      console.error(
        "Error fetching deleted feedback comment likes as admin:",
        error
      );
      return { likes: null, error };
    }
  }
}

// Export default for convenience
export default FeedbackCommentLikeService;
