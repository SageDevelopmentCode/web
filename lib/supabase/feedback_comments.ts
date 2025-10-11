import { supabase } from "../supabase";
import { FeedbackCommentLikeBatchService } from "./feedback_comments_likes_batch";

// TypeScript interfaces for the feedback_comments table
export interface FeedbackComment {
  id: string;
  feedback_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateFeedbackCommentData {
  feedback_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null;
  is_deleted?: boolean;
}

export interface UpdateFeedbackCommentData {
  content?: string;
  is_deleted?: boolean;
  updated_at?: string;
}

export interface FeedbackCommentFilters {
  feedback_id?: string;
  user_id?: string;
  parent_comment_id?: string | null;
  is_deleted?: boolean;
}

// Extended comment interface with user information
export interface FeedbackCommentWithUser extends FeedbackComment {
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
  replies?: FeedbackCommentWithUser[];
  reply_count?: number;
  like_count?: number;
  user_has_liked?: boolean;
}

// Feedback Comment CRUD operations
export class FeedbackCommentService {
  // Create a new feedback comment
  static async createFeedbackComment(
    commentData: CreateFeedbackCommentData
  ): Promise<{ comment: FeedbackComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments")
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
      console.error("Error creating feedback comment:", error);
      return { comment: null, error };
    }
  }

  // Get a feedback comment by ID
  static async getFeedbackCommentById(
    commentId: string
  ): Promise<{ comment: FeedbackComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments")
        .select("*")
        .eq("id", commentId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      return { comment: data, error: null };
    } catch (error) {
      console.error("Error fetching feedback comment:", error);
      return { comment: null, error };
    }
  }

  // Get feedback comments with filters
  static async getFeedbackComments(
    filters?: FeedbackCommentFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeedbackComment[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("feedback_comments")
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
      console.error("Error fetching feedback comments:", error);
      return { comments: null, error, count: 0 };
    }
  }

  // Get comments for a specific feedback post
  static async getFeedbackCommentsByFeedbackId(
    feedbackId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeedbackComment[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedbackComments({ feedback_id: feedbackId }, limit, offset);
  }

  // Get comments by a specific user
  static async getFeedbackCommentsByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeedbackComment[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedbackComments({ user_id: userId }, limit, offset);
  }

  // Get top-level comments (no parent) for a feedback post
  static async getTopLevelFeedbackComments(
    feedbackId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    comments: FeedbackComment[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedbackComments(
      { feedback_id: feedbackId, parent_comment_id: null },
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
    replies: FeedbackComment[] | null;
    error: any;
    count?: number;
  }> {
    const result = await this.getFeedbackComments(
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

  // Get feedback comments with user information
  static async getFeedbackCommentsWithUsers(
    feedbackId: string,
    includeReplies: boolean = true,
    limit?: number,
    offset?: number,
    userId?: string
  ): Promise<{
    comments: FeedbackCommentWithUser[] | null;
    error: any;
    count?: number;
  }> {
    try {
      // QUERY 1: Fetch ALL comments (parents + replies) for this feedback in ONE query
      const { data: allComments, error: commentsError } = await supabase
        .from("feedback_comments")
        .select("*")
        .eq("feedback_id", feedbackId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;
      if (!allComments || allComments.length === 0) {
        return { comments: [], error: null, count: 0 };
      }

      // Separate parent comments and replies in memory
      const parentComments = allComments.filter(
        (c) => c.parent_comment_id === null
      );
      const allReplies = allComments.filter(
        (c) => c.parent_comment_id !== null
      );

      // Apply pagination to parent comments only
      const paginatedParents = limit
        ? parentComments.slice(offset || 0, (offset || 0) + limit)
        : parentComments;

      // Get total count of parent comments
      const count = parentComments.length;

      // Build replies map for quick lookup
      const repliesMap = new Map<string, FeedbackComment[]>();
      allReplies.forEach((reply) => {
        const parentId = reply.parent_comment_id!;
        if (!repliesMap.has(parentId)) {
          repliesMap.set(parentId, []);
        }
        repliesMap.get(parentId)!.push(reply);
      });

      // Calculate reply counts in memory
      const replyCountsMap = new Map<string, number>();
      parentComments.forEach((parent) => {
        const replies = repliesMap.get(parent.id) || [];
        replyCountsMap.set(parent.id, replies.length);
      });

      // Recursive helper to collect all nested reply IDs
      const collectNestedReplyIds = (
        parentId: string,
        commentIds: string[],
        userIds: Set<string>
      ) => {
        const replies = repliesMap.get(parentId) || [];
        replies.forEach((reply) => {
          commentIds.push(reply.id);
          userIds.add(reply.user_id);
          // Recursively collect nested replies
          collectNestedReplyIds(reply.id, commentIds, userIds);
        });
      };

      // Collect all comment IDs that we need data for
      const relevantCommentIds = [...paginatedParents.map((c) => c.id)];
      const uniqueUserIds = new Set<string>();
      paginatedParents.forEach((c) => uniqueUserIds.add(c.user_id));

      if (includeReplies) {
        paginatedParents.forEach((parent) => {
          collectNestedReplyIds(parent.id, relevantCommentIds, uniqueUserIds);
        });
      }

      // QUERY 2: Batch fetch ALL users in ONE query
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("user_id, display_name, profile_picture")
        .in("user_id", Array.from(uniqueUserIds));

      if (usersError) throw usersError;

      // Create user lookup map
      const usersMap = new Map(
        usersData?.map((user) => [user.user_id, user]) || []
      );

      // QUERY 3: Batch fetch ALL likes in ONE query
      const { comments: likeBatchData } =
        await FeedbackCommentLikeBatchService.getCommentLikesBatch(
          relevantCommentIds,
          userId
        );

      // Create like data lookup map
      const likeDataMap = new Map<
        string,
        { likeCount: number; userHasLiked: boolean }
      >(
        likeBatchData.map((item: any) => [
          item.commentId,
          { likeCount: item.likeCount, userHasLiked: item.userHasLiked },
        ])
      );

      // Recursive helper function to build nested replies
      const buildNestedReplies = (
        parentId: string
      ): FeedbackCommentWithUser[] => {
        const directReplies = repliesMap.get(parentId) || [];

        return directReplies.map((reply) => {
          const replyUserData = usersMap.get(reply.user_id);
          const replyLikeData = likeDataMap.get(reply.id);

          // Recursively get nested replies for this reply
          const nestedReplies = buildNestedReplies(reply.id);

          return {
            ...reply,
            user: replyUserData || undefined,
            like_count: replyLikeData?.likeCount || 0,
            user_has_liked: replyLikeData?.userHasLiked || false,
            replies: nestedReplies,
            reply_count: nestedReplies.length,
          };
        });
      };

      // Build the final structure with all data
      const commentsWithUsers: FeedbackCommentWithUser[] = paginatedParents.map(
        (comment) => {
          const userData = usersMap.get(comment.user_id);
          const likeData = likeDataMap.get(comment.id);
          const directReplies = repliesMap.get(comment.id) || [];

          const commentWithUser: FeedbackCommentWithUser = {
            ...comment,
            user: userData || undefined,
            like_count: likeData?.likeCount || 0,
            user_has_liked: likeData?.userHasLiked || false,
            reply_count: directReplies.length, // Only count direct replies
          };

          // Add nested replies if requested
          if (includeReplies) {
            commentWithUser.replies = buildNestedReplies(comment.id);
          } else {
            commentWithUser.replies = [];
          }

          return commentWithUser;
        }
      );

      return { comments: commentsWithUsers, error: null, count };
    } catch (error) {
      console.error("Error fetching feedback comments with users:", error);
      return { comments: null, error, count: 0 };
    }
  }

  // Update a feedback comment
  static async updateFeedbackComment(
    commentId: string,
    updates: UpdateFeedbackCommentData
  ): Promise<{ comment: FeedbackComment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments")
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
      console.error("Error updating feedback comment:", error);
      return { comment: null, error };
    }
  }

  // Soft delete a feedback comment (set is_deleted to true)
  static async deleteFeedbackComment(
    commentId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_comments")
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
      console.error("Error deleting feedback comment:", error);
      return { success: false, error };
    }
  }

  // Hard delete a feedback comment (permanent removal)
  static async hardDeleteFeedbackComment(
    commentId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feedback_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feedback comment:", error);
      return { success: false, error };
    }
  }

  // Get total comment count for a feedback post
  static async getTotalCommentCount(
    feedbackId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback_comments")
        .select("*", { count: "exact", head: true })
        .eq("feedback_id", feedbackId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting total comment count:", error);
      return { count: 0, error };
    }
  }

  // Get top-level comment count for a feedback post
  static async getTopLevelCommentCount(
    feedbackId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback_comments")
        .select("*", { count: "exact", head: true })
        .eq("feedback_id", feedbackId)
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
        .from("feedback_comments")
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

  // Check if user has commented on a feedback post
  static async hasUserCommentedOnFeedback(
    feedbackId: string,
    userId: string
  ): Promise<{
    hasCommented: boolean;
    commentCount: number;
    error: any;
  }> {
    try {
      const { count, error } = await supabase
        .from("feedback_comments")
        .select("*", { count: "exact", head: true })
        .eq("feedback_id", feedbackId)
        .eq("user_id", userId)
        .eq("is_deleted", false);

      if (error) throw error;

      return {
        hasCommented: (count || 0) > 0,
        commentCount: count || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error checking user comments on feedback:", error);
      return { hasCommented: false, commentCount: 0, error };
    }
  }

  // Get comment thread (comment + all its replies)
  static async getCommentThread(
    commentId: string,
    userId?: string
  ): Promise<{
    thread: FeedbackCommentWithUser | null;
    error: any;
  }> {
    try {
      // Get the main comment
      const { comment, error: commentError } =
        await this.getFeedbackCommentById(commentId);

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
        allCommentIds.push(...replies.map((r) => r.id));
      }

      // Batch fetch all like data in one query
      const { comments: likeBatchData } =
        await FeedbackCommentLikeBatchService.getCommentLikesBatch(
          allCommentIds,
          userId
        );

      // Create a map for quick lookup
      const likeDataMap = new Map<
        string,
        { likeCount: number; userHasLiked: boolean }
      >(
        likeBatchData.map((item: any) => [
          item.commentId,
          { likeCount: item.likeCount, userHasLiked: item.userHasLiked },
        ])
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
      const repliesWithUsers: FeedbackCommentWithUser[] = [];
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

      const thread: FeedbackCommentWithUser = {
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
export class FeedbackCommentAdminService {
  // Force delete a feedback comment (bypasses RLS)
  static async forceDeleteFeedbackComment(
    commentId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feedback_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feedback comment:", error);
      return { success: false, error };
    }
  }

  // Get all feedback comments as admin (bypasses RLS)
  static async getAllFeedbackCommentsAdmin(): Promise<{
    comments: FeedbackComment[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { comments: data, error: null };
    } catch (error) {
      console.error("Error fetching all feedback comments as admin:", error);
      return { comments: null, error };
    }
  }

  // Get deleted feedback comments as admin
  static async getDeletedFeedbackCommentsAdmin(): Promise<{
    comments: FeedbackComment[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_comments")
        .select("*")
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return { comments: data, error: null };
    } catch (error) {
      console.error(
        "Error fetching deleted feedback comments as admin:",
        error
      );
      return { comments: null, error };
    }
  }

  // Bulk delete comments by feedback (admin only)
  static async bulkDeleteCommentsByFeedback(
    feedbackId: string
  ): Promise<{ success: boolean; deletedCount: number; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_comments")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("feedback_id", feedbackId)
        .select();

      if (error) throw error;
      return {
        success: true,
        deletedCount: data?.length || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error bulk deleting comments by feedback:", error);
      return { success: false, deletedCount: 0, error };
    }
  }
}

// Export default for convenience
export default FeedbackCommentService;
