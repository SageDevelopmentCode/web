import { supabase } from "../supabase";
import { FeatureCommentLikeBatchService } from "./feature_comments_likes_batch";

// TypeScript interfaces for the feature_comments table
export interface FeatureComment {
  id: string;
  feature_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateFeatureCommentData {
  feature_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null;
  is_deleted?: boolean;
}

export interface UpdateFeatureCommentData {
  content?: string;
  is_deleted?: boolean;
  updated_at?: string;
}

export interface FeatureCommentFilters {
  feature_id?: string;
  user_id?: string;
  parent_comment_id?: string | null;
  is_deleted?: boolean;
}

// Extended comment interface with user information
export interface FeatureCommentWithUser extends FeatureComment {
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
  replies?: FeatureCommentWithUser[];
  reply_count?: number;
  like_count?: number;
  user_has_liked?: boolean;
}

// Feature Comment CRUD operations
export class FeatureCommentService {
  // Create a new feature comment
  static async createFeatureComment(
    commentData: CreateFeatureCommentData
  ): Promise<{ comment: FeatureComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments")
        .insert([
          {
            ...commentData,
            parent_comment_id: commentData.parent_comment_id || null,
            is_deleted: commentData.is_deleted ?? false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { comment: data, error: null };
    } catch (error) {
      console.error("Error creating feature comment:", error);
      return { comment: null, error };
    }
  }

  // Get a feature comment by ID
  static async getFeatureCommentById(
    commentId: string
  ): Promise<{ comment: FeatureComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments")
        .select("*")
        .eq("id", commentId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      return { comment: data, error: null };
    } catch (error) {
      console.error("Error fetching feature comment:", error);
      return { comment: null, error };
    }
  }

  // Get feature comments with filters
  static async getFeatureComments(
    filters?: FeatureCommentFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeatureComment[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("feature_comments")
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
      if (filters?.parent_comment_id !== undefined) {
        if (filters.parent_comment_id === null) {
          query = query.is("parent_comment_id", null);
        } else {
          query = query.eq("parent_comment_id", filters.parent_comment_id);
        }
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { comments: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching feature comments:", error);
      return { comments: null, error, count: 0 };
    }
  }

  // Get comments for a specific feature
  static async getFeatureCommentsByFeatureId(
    featureId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeatureComment[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeatureComments({ feature_id: featureId }, limit, offset);
  }

  // Get comments by a specific user
  static async getFeatureCommentsByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeatureComment[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeatureComments({ user_id: userId }, limit, offset);
  }

  // Get top-level comments (no parent) for a feature
  static async getTopLevelFeatureComments(
    featureId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeatureComment[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeatureComments(
      { feature_id: featureId, parent_comment_id: null },
      limit,
      offset
    );
  }

  // Get replies to a specific comment
  static async getCommentReplies(
    commentId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    replies: FeatureComment[] | null;
    error: any;
    count?: number;
  }> {
    const result = await this.getFeatureComments(
      { parent_comment_id: commentId },
      limit,
      offset
    );
    return {
      replies: result.comments,
      error: result.error,
      count: result.count,
    };
  }

  // Get feature comments with user information
  static async getFeatureCommentsWithUsers(
    featureId: string,
    includeReplies: boolean = true,
    limit?: number,
    offset?: number,
    userId?: string
  ): Promise<{
    comments: FeatureCommentWithUser[] | null;
    error: any;
    count?: number;
  }> {
    try {
      // First get top-level comments
      const {
        comments: topLevelComments,
        error: topLevelError,
        count,
      } = await this.getTopLevelFeatureComments(featureId, limit, offset);

      if (topLevelError) throw topLevelError;

      if (!topLevelComments) {
        return { comments: [], error: null, count: 0 };
      }

      // Collect all comment IDs (parents + replies) for batch like fetching
      const allCommentIds: string[] = [...topLevelComments.map(c => c.id)];

      // Get replies first if requested, to collect all IDs
      const repliesMap: Map<string, FeatureComment[]> = new Map();
      if (includeReplies) {
        for (const comment of topLevelComments) {
          const { replies } = await this.getCommentReplies(comment.id);
          if (replies && replies.length > 0) {
            repliesMap.set(comment.id, replies);
            // Add reply IDs to allCommentIds
            allCommentIds.push(...replies.map(r => r.id));
          }
        }
      }

      // Batch fetch all like data in one query
      const { comments: likeBatchData } = await FeatureCommentLikeBatchService.getCommentLikesBatch(
        allCommentIds,
        userId
      );

      // Create a map for quick lookup
      const likeDataMap = new Map(
        likeBatchData.map(item => [item.commentId, item])
      );

      // Get user information for each comment
      const commentsWithUsers: FeatureCommentWithUser[] = [];

      for (const comment of topLevelComments) {
        const { data: userData } = await supabase
          .from("users")
          .select("user_id, display_name, profile_picture")
          .eq("user_id", comment.user_id)
          .single();

        // Get like data from batch
        const likeData = likeDataMap.get(comment.id);

        const commentWithUser: FeatureCommentWithUser = {
          ...comment,
          user: userData || undefined,
          like_count: likeData?.likeCount || 0,
          user_has_liked: likeData?.userHasLiked || false,
        };

        // Get reply count
        const { count: replyCount } = await supabase
          .from("feature_comments")
          .select("*", { count: "exact", head: true })
          .eq("parent_comment_id", comment.id)
          .eq("is_deleted", false);

        commentWithUser.reply_count = replyCount || 0;

        // Get replies if requested
        if (includeReplies) {
          const replies = repliesMap.get(comment.id);
          if (replies && replies.length > 0) {
            // Fetch user data for each reply
            const repliesWithUsers: FeatureCommentWithUser[] = [];
            for (const reply of replies) {
              const { data: replyUserData } =
                await supabase
                  .from("users")
                  .select("user_id, display_name, profile_picture")
                  .eq("user_id", reply.user_id)
                  .single();

              // Get like data from batch for reply
              const replyLikeData = likeDataMap.get(reply.id);

              repliesWithUsers.push({
                ...reply,
                user: replyUserData || undefined,
                like_count: replyLikeData?.likeCount || 0,
                user_has_liked: replyLikeData?.userHasLiked || false,
              });
            }
            commentWithUser.replies = repliesWithUsers;
          } else {
            commentWithUser.replies = [];
          }
        }

        commentsWithUsers.push(commentWithUser);
      }

      return { comments: commentsWithUsers, error: null, count };
    } catch (error) {
      console.error("Error fetching feature comments with users:", error);
      return { comments: null, error, count: 0 };
    }
  }

  // Update a feature comment
  static async updateFeatureComment(
    commentId: string,
    updates: UpdateFeatureCommentData
  ): Promise<{ comment: FeatureComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select()
        .single();

      if (error) throw error;
      return { comment: data, error: null };
    } catch (error) {
      console.error("Error updating feature comment:", error);
      return { comment: null, error };
    }
  }

  // Soft delete a feature comment (set is_deleted to true)
  static async deleteFeatureComment(
    commentId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feature_comments")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting feature comment:", error);
      return { success: false, error };
    }
  }

  // Hard delete a feature comment (permanent removal)
  static async hardDeleteFeatureComment(
    commentId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feature_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feature comment:", error);
      return { success: false, error };
    }
  }

  // Get total comment count for a feature
  static async getTotalCommentCount(
    featureId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feature_comments")
        .select("*", { count: "exact", head: true })
        .eq("feature_id", featureId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting total comment count:", error);
      return { count: 0, error };
    }
  }

  // Get top-level comment count for a feature
  static async getTopLevelCommentCount(
    featureId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feature_comments")
        .select("*", { count: "exact", head: true })
        .eq("feature_id", featureId)
        .is("parent_comment_id", null)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting top-level comment count:", error);
      return { count: 0, error };
    }
  }

  // Get reply count for a specific comment
  static async getReplyCount(
    commentId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feature_comments")
        .select("*", { count: "exact", head: true })
        .eq("parent_comment_id", commentId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting reply count:", error);
      return { count: 0, error };
    }
  }

  // Check if user has commented on a feature
  static async hasUserCommentedOnFeature(
    featureId: string,
    userId: string
  ): Promise<{
    hasCommented: boolean;
    commentCount: number;
    error: any;
  }> {
    try {
      const { count, error } = await supabase
        .from("feature_comments")
        .select("*", { count: "exact", head: true })
        .eq("feature_id", featureId)
        .eq("user_id", userId)
        .eq("is_deleted", false);

      if (error) throw error;

      return {
        hasCommented: (count || 0) > 0,
        commentCount: count || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error checking user comments on feature:", error);
      return { hasCommented: false, commentCount: 0, error };
    }
  }

  // Get comment thread (comment + all its replies)
  static async getCommentThread(
    commentId: string,
    userId?: string
  ): Promise<{
    thread: FeatureCommentWithUser | null;
    error: any;
  }> {
    try {
      // Get the main comment
      const { comment, error: commentError } = await this.getFeatureCommentById(
        commentId
      );

      if (commentError) throw commentError;
      if (!comment) {
        return { thread: null, error: null };
      }

      // Get all replies
      const { replies, error: repliesError } = await this.getCommentReplies(
        commentId
      );

      if (repliesError) throw repliesError;

      // Collect all comment IDs for batch like fetching
      const allCommentIds = [commentId];
      if (replies) {
        allCommentIds.push(...replies.map(r => r.id));
      }

      // Batch fetch all like data in one query
      const { comments: likeBatchData } = await FeatureCommentLikeBatchService.getCommentLikesBatch(
        allCommentIds,
        userId
      );

      // Create a map for quick lookup
      const likeDataMap = new Map(
        likeBatchData.map(item => [item.commentId, item])
      );

      // Get user information
      const { data: userData } = await supabase
        .from("users")
        .select("user_id, display_name, profile_picture")
        .eq("user_id", comment.user_id)
        .single();

      // Get like data for main comment
      const commentLikeData = likeDataMap.get(commentId);

      // Get user information for replies
      const repliesWithUsers: FeatureCommentWithUser[] = [];
      if (replies) {
        for (const reply of replies) {
          const { data: replyUserData } = await supabase
            .from("users")
            .select("user_id, display_name, profile_picture")
            .eq("user_id", reply.user_id)
            .single();

          // Get like data for reply
          const replyLikeData = likeDataMap.get(reply.id);

          repliesWithUsers.push({
            ...reply,
            user: replyUserData || undefined,
            replies: [],
            like_count: replyLikeData?.likeCount || 0,
            user_has_liked: replyLikeData?.userHasLiked || false,
          });
        }
      }

      const thread: FeatureCommentWithUser = {
        ...comment,
        user: userData || undefined,
        replies: repliesWithUsers,
        reply_count: repliesWithUsers.length,
        like_count: commentLikeData?.likeCount || 0,
        user_has_liked: commentLikeData?.userHasLiked || false,
      };

      return { thread, error: null };
    } catch (error) {
      console.error("Error getting comment thread:", error);
      return { thread: null, error };
    }
  }
}

// Admin operations (using service role key)
export class FeatureCommentAdminService {
  // Force delete a feature comment (bypasses RLS)
  static async forceDeleteFeatureComment(
    commentId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feature_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feature comment:", error);
      return { success: false, error };
    }
  }

  // Get all feature comments as admin (bypasses RLS)
  static async getAllFeatureCommentsAdmin(): Promise<{
    comments: FeatureComment[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feature_comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { comments: data, error: null };
    } catch (error) {
      console.error("Error fetching all feature comments as admin:", error);
      return { comments: null, error };
    }
  }

  // Get deleted feature comments as admin
  static async getDeletedFeatureCommentsAdmin(): Promise<{
    comments: FeatureComment[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feature_comments")
        .select("*")
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return { comments: data, error: null };
    } catch (error) {
      console.error("Error fetching deleted feature comments as admin:", error);
      return { comments: null, error };
    }
  }

  // Bulk delete comments by feature (admin only)
  static async bulkDeleteCommentsByFeature(
    featureId: string
  ): Promise<{ success: boolean; deletedCount: number; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feature_comments")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("feature_id", featureId)
        .select();

      if (error) throw error;
      return {
        success: true,
        deletedCount: data?.length || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error bulk deleting comments by feature:", error);
      return { success: false, deletedCount: 0, error };
    }
  }
}

// Export default for convenience
export default FeatureCommentService;
