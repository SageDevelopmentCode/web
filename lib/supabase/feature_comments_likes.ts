import { supabase } from "../supabase";

// TypeScript interfaces for the feature_comments_likes table
export interface FeatureCommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateFeatureCommentLikeData {
  comment_id: string;
  user_id: string;
  is_deleted?: boolean;
}

export interface UpdateFeatureCommentLikeData {
  is_deleted?: boolean;
  updated_at?: string;
}

export interface FeatureCommentLikeFilters {
  comment_id?: string;
  user_id?: string;
  is_deleted?: boolean;
}

// Feature Comment Like CRUD operations
export class FeatureCommentLikeService {
  // Create a new feature comment like
  static async createFeatureCommentLike(
    likeData: CreateFeatureCommentLikeData
  ): Promise<{ like: FeatureCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments_likes")
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
      console.error("Error creating feature comment like:", error);
      return { like: null, error };
    }
  }

  // Get a feature comment like by ID
  static async getFeatureCommentLikeById(
    likeId: string
  ): Promise<{ like: FeatureCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments_likes")
        .select("*")
        .eq("id", likeId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      return { like: data, error: null };
    } catch (error) {
      console.error("Error fetching feature comment like:", error);
      return { like: null, error };
    }
  }

  // Get feature comment likes with filters
  static async getFeatureCommentLikes(
    filters?: FeatureCommentLikeFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    likes: FeatureCommentLike[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("feature_comments_likes")
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
      console.error("Error fetching feature comment likes:", error);
      return { likes: null, error, count: 0 };
    }
  }

  // Get likes for a specific comment
  static async getCommentLikes(
    commentId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    likes: FeatureCommentLike[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeatureCommentLikes(
      { comment_id: commentId },
      limit,
      offset
    );
  }

  // Get likes by a specific user
  static async getFeatureCommentLikesByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    likes: FeatureCommentLike[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeatureCommentLikes({ user_id: userId }, limit, offset);
  }

  // Get user's like for a specific comment
  static async getUserCommentLike(
    commentId: string,
    userId: string
  ): Promise<{ like: FeatureCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments_likes")
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

  // Update a feature comment like
  static async updateFeatureCommentLike(
    likeId: string,
    updates: UpdateFeatureCommentLikeData
  ): Promise<{ like: FeatureCommentLike | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments_likes")
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
      console.error("Error updating feature comment like:", error);
      return { like: null, error };
    }
  }

  // Soft delete a feature comment like (set is_deleted to true)
  static async deleteFeatureCommentLike(
    likeId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments_likes")
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
      console.error("Error deleting feature comment like:", error);
      return { success: false, error };
    }
  }

  // Hard delete a feature comment like (permanent removal)
  static async hardDeleteFeatureCommentLike(
    likeId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feature_comments_likes")
        .delete()
        .eq("id", likeId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feature comment like:", error);
      return { success: false, error };
    }
  }

  // Toggle user like on a comment
  static async toggleUserCommentLike(
    commentId: string,
    userId: string
  ): Promise<{ like: FeatureCommentLike | null; error: any }> {
    try {
      // Check if user already has a like
      const { like: existingLike, error: fetchError } =
        await this.getUserCommentLike(commentId, userId);

      if (fetchError) {
        throw fetchError;
      }

      if (existingLike) {
        // If user already liked, remove it (soft delete)
        const { success, error } = await this.deleteFeatureCommentLike(
          existingLike.id
        );
        if (error) throw error;
        return { like: null, error: null };
      } else {
        // Create new like
        return this.createFeatureCommentLike({
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
        .from("feature_comments_likes")
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
export class FeatureCommentLikeAdminService {
  // Force delete a feature comment like (bypasses RLS)
  static async forceDeleteFeatureCommentLike(
    likeId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feature_comments_likes")
        .delete()
        .eq("id", likeId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feature comment like:", error);
      return { success: false, error };
    }
  }

  // Get all feature comment likes as admin (bypasses RLS)
  static async getAllFeatureCommentLikesAdmin(): Promise<{
    likes: FeatureCommentLike[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feature_comments_likes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { likes: data, error: null };
    } catch (error) {
      console.error("Error fetching all feature comment likes as admin:", error);
      return { likes: null, error };
    }
  }

  // Get deleted feature comment likes as admin
  static async getDeletedFeatureCommentLikesAdmin(): Promise<{
    likes: FeatureCommentLike[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feature_comments_likes")
        .select("*")
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return { likes: data, error: null };
    } catch (error) {
      console.error(
        "Error fetching deleted feature comment likes as admin:",
        error
      );
      return { likes: null, error };
    }
  }
}

// Export default for convenience
export default FeatureCommentLikeService;
