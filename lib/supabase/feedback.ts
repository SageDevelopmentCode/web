import { supabase } from "../supabase";

// TypeScript interfaces for the feedback table
export interface Feedback {
  id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user_id: string;
  feature_id: string | null;
  title: string;
  description: string | null;
}

export interface CreateFeedbackData {
  user_id: string;
  title: string;
  description?: string | null;
  feature_id?: string | null;
  is_deleted?: boolean;
}

export interface UpdateFeedbackData {
  title?: string;
  description?: string | null;
  feature_id?: string | null;
  is_deleted?: boolean;
  updated_at?: string;
}

export interface FeedbackFilters {
  user_id?: string;
  feature_id?: string | null;
  is_deleted?: boolean;
}

// Extended feedback interface with user information
export interface FeedbackWithUser extends Feedback {
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
}

// Extended feedback interface with tags
export interface FeedbackWithTags extends Feedback {
  tags?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

// Extended feedback interface with both user and tags
export interface FeedbackWithUserAndTags extends FeedbackWithUser {
  tags?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}

// Extended comment interface with user information for complete fetch
export interface FeedbackCommentWithUserComplete {
  id: string;
  feedback_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
  replies?: FeedbackCommentWithUserComplete[];
  reply_count?: number;
  like_count?: number;
  user_has_liked?: boolean;
}

// Complete feedback interface with reactions, comments, and nested replies
export interface FeedbackWithUserAndTagsComplete
  extends FeedbackWithUserAndTags {
  reaction_count: number;
  user_has_reacted: boolean;
  comment_count: number;
  comments: FeedbackCommentWithUserComplete[];
}

// Feedback CRUD operations
export class FeedbackService {
  // Create a new feedback
  static async createFeedback(
    feedbackData: CreateFeedbackData
  ): Promise<{ feedback: Feedback | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .insert([
          {
            ...feedbackData,
            feature_id: feedbackData.feature_id || null,
            description: feedbackData.description || null,
            is_deleted: feedbackData.is_deleted ?? false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { feedback: data, error: null };
    } catch (error) {
      console.error("Error creating feedback:", error);
      return { feedback: null, error };
    }
  }

  // Get a feedback by ID
  static async getFeedbackById(
    feedbackId: string
  ): Promise<{ feedback: Feedback | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("id", feedbackId)
        .eq("is_deleted", false)
        .single();

      if (error) throw error;
      return { feedback: data, error: null };
    } catch (error) {
      console.error("Error fetching feedback:", error);
      return { feedback: null, error };
    }
  }

  // Get feedback with filters
  static async getFeedback(
    filters?: FeedbackFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: Feedback[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("feedback")
        .select("*", { count: "exact" })
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters?.feature_id !== undefined) {
        if (filters.feature_id === null) {
          query = query.is("feature_id", null);
        } else {
          query = query.eq("feature_id", filters.feature_id);
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
      return { feedback: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching feedback:", error);
      return { feedback: null, error, count: 0 };
    }
  }

  // Get feedback by user ID
  static async getFeedbackByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: Feedback[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedback({ user_id: userId }, limit, offset);
  }

  // Get feedback by feature ID
  static async getFeedbackByFeatureId(
    featureId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: Feedback[] | null;
    error: any;
    count?: number;
  }> {
    return this.getFeedback({ feature_id: featureId }, limit, offset);
  }

  // Get feedback with user information
  static async getFeedbackWithUsers(
    filters?: FeedbackFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: FeedbackWithUser[] | null;
    error: any;
    count?: number;
  }> {
    try {
      // Fetch feedback
      const {
        feedback,
        error: feedbackError,
        count,
      } = await this.getFeedback(filters, limit, offset);

      if (feedbackError) throw feedbackError;
      if (!feedback || feedback.length === 0) {
        return { feedback: [], error: null, count: 0 };
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(feedback.map((f) => f.user_id))];

      // Batch fetch all users in one query
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("user_id, display_name, profile_picture")
        .in("user_id", uniqueUserIds);

      if (usersError) throw usersError;

      // Create user lookup map
      const usersMap = new Map(
        usersData?.map((user) => [user.user_id, user]) || []
      );

      // Build the final structure with user data
      const feedbackWithUsers: FeedbackWithUser[] = feedback.map((fb) => ({
        ...fb,
        user: usersMap.get(fb.user_id) || undefined,
      }));

      return { feedback: feedbackWithUsers, error: null, count };
    } catch (error) {
      console.error("Error fetching feedback with users:", error);
      return { feedback: null, error, count: 0 };
    }
  }

  // Get feedback with tags
  static async getFeedbackWithTags(
    filters?: FeedbackFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: FeedbackWithTags[] | null;
    error: any;
    count?: number;
  }> {
    try {
      // Fetch feedback
      const {
        feedback,
        error: feedbackError,
        count,
      } = await this.getFeedback(filters, limit, offset);

      if (feedbackError) throw feedbackError;
      if (!feedback || feedback.length === 0) {
        return { feedback: [], error: null, count: 0 };
      }

      // Get unique feedback IDs
      const feedbackIds = feedback.map((f) => f.id);

      // Batch fetch all feedback_tags with tag details
      const { data: feedbackTagsData, error: tagsError } = await supabase
        .from("feedback_tags")
        .select(
          `
          feedback_id,
          tags (
            id,
            name,
            description
          )
        `
        )
        .in("feedback_id", feedbackIds)
        .eq("is_deleted", false);

      if (tagsError) throw tagsError;

      // Create a map of feedback_id to tags
      const tagsMap = new Map<string, any[]>();
      feedbackTagsData?.forEach((item: any) => {
        if (item.tags) {
          if (!tagsMap.has(item.feedback_id)) {
            tagsMap.set(item.feedback_id, []);
          }
          tagsMap.get(item.feedback_id)?.push(item.tags);
        }
      });

      // Build the final structure with tags
      const feedbackWithTags: FeedbackWithTags[] = feedback.map((fb) => ({
        ...fb,
        tags: tagsMap.get(fb.id) || [],
      }));

      return { feedback: feedbackWithTags, error: null, count };
    } catch (error) {
      console.error("Error fetching feedback with tags:", error);
      return { feedback: null, error, count: 0 };
    }
  }

  // Get feedback with both users and tags
  static async getFeedbackWithUsersAndTags(
    filters?: FeedbackFilters,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: FeedbackWithUserAndTags[] | null;
    error: any;
    count?: number;
  }> {
    try {
      // Fetch feedback
      const {
        feedback,
        error: feedbackError,
        count,
      } = await this.getFeedback(filters, limit, offset);

      if (feedbackError) throw feedbackError;
      if (!feedback || feedback.length === 0) {
        return { feedback: [], error: null, count: 0 };
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(feedback.map((f) => f.user_id))];
      const feedbackIds = feedback.map((f) => f.id);

      // Batch fetch users and tags in parallel
      const [usersResult, tagsResult] = await Promise.all([
        supabase
          .from("users")
          .select("user_id, display_name, profile_picture")
          .in("user_id", uniqueUserIds),
        supabase
          .from("feedback_tags")
          .select(
            `
            feedback_id,
            tags (
              id,
              name,
              description
            )
          `
          )
          .in("feedback_id", feedbackIds)
          .eq("is_deleted", false),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (tagsResult.error) throw tagsResult.error;

      // Create user lookup map
      const usersMap = new Map(
        usersResult.data?.map((user) => [user.user_id, user]) || []
      );

      // Create tags map
      const tagsMap = new Map<string, any[]>();
      tagsResult.data?.forEach((item: any) => {
        if (item.tags) {
          if (!tagsMap.has(item.feedback_id)) {
            tagsMap.set(item.feedback_id, []);
          }
          tagsMap.get(item.feedback_id)?.push(item.tags);
        }
      });

      // Build the final structure with both user and tags data
      const feedbackWithUsersAndTags: FeedbackWithUserAndTags[] = feedback.map(
        (fb) => ({
          ...fb,
          user: usersMap.get(fb.user_id) || undefined,
          tags: tagsMap.get(fb.id) || [],
        })
      );

      return { feedback: feedbackWithUsersAndTags, error: null, count };
    } catch (error) {
      console.error("Error fetching feedback with users and tags:", error);
      return { feedback: null, error, count: 0 };
    }
  }

  // Get feedback by tag ID (using the junction table)
  static async getFeedbackByTagId(
    tagId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: Feedback[] | null;
    error: any;
    count?: number;
  }> {
    try {
      // First get all feedback IDs that have this tag
      const { data: feedbackTagsData, error: feedbackTagsError } =
        await supabase
          .from("feedback_tags")
          .select("feedback_id")
          .eq("tag_id", tagId)
          .eq("is_deleted", false);

      if (feedbackTagsError) throw feedbackTagsError;

      if (!feedbackTagsData || feedbackTagsData.length === 0) {
        return { feedback: [], error: null, count: 0 };
      }

      const feedbackIds = feedbackTagsData.map((item) => item.feedback_id);

      // Now fetch the feedback
      let query = supabase
        .from("feedback")
        .select("*", { count: "exact" })
        .in("id", feedbackIds)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { feedback: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching feedback by tag:", error);
      return { feedback: null, error, count: 0 };
    }
  }

  // Update a feedback
  static async updateFeedback(
    feedbackId: string,
    updates: UpdateFeedbackData
  ): Promise<{ feedback: Feedback | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", feedbackId)
        .select()
        .single();

      if (error) throw error;
      return { feedback: data, error: null };
    } catch (error) {
      console.error("Error updating feedback:", error);
      return { feedback: null, error };
    }
  }

  // Soft delete a feedback (set is_deleted to true)
  static async deleteFeedback(
    feedbackId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", feedbackId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting feedback:", error);
      return { success: false, error };
    }
  }

  // Hard delete a feedback (permanent removal)
  static async hardDeleteFeedback(
    feedbackId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feedback:", error);
      return { success: false, error };
    }
  }

  // Get total feedback count
  static async getTotalFeedbackCount(): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting total feedback count:", error);
      return { count: 0, error };
    }
  }

  // Get feedback count by user
  static async getFeedbackCountByUser(
    userId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting feedback count by user:", error);
      return { count: 0, error };
    }
  }

  // Get feedback count by feature
  static async getFeedbackCountByFeature(
    featureId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("feature_id", featureId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting feedback count by feature:", error);
      return { count: 0, error };
    }
  }

  // Check if user has submitted feedback for a feature
  static async hasUserSubmittedFeedbackForFeature(
    featureId: string,
    userId: string
  ): Promise<{
    hasSubmitted: boolean;
    feedbackCount: number;
    error: any;
  }> {
    try {
      const { count, error } = await supabase
        .from("feedback")
        .select("*", { count: "exact", head: true })
        .eq("feature_id", featureId)
        .eq("user_id", userId)
        .eq("is_deleted", false);

      if (error) throw error;

      return {
        hasSubmitted: (count || 0) > 0,
        feedbackCount: count || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error checking user feedback for feature:", error);
      return { hasSubmitted: false, feedbackCount: 0, error };
    }
  }

  // Search feedback by title or description
  static async searchFeedback(
    searchTerm: string,
    limit?: number,
    offset?: number
  ): Promise<{
    feedback: Feedback[] | null;
    error: any;
    count?: number;
  }> {
    try {
      const { data, error, count } = await supabase
        .from("feedback")
        .select("*", { count: "exact" })
        .eq("is_deleted", false)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false })
        .range(offset || 0, (offset || 0) + (limit || 10) - 1);

      if (error) throw error;
      return { feedback: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error searching feedback:", error);
      return { feedback: null, error, count: 0 };
    }
  }

  // COMPREHENSIVE FETCH: Get feedback with users, tags, reactions, comments, and nested replies
  // This method fetches everything in optimized batch queries to minimize network calls
  static async getFeedbackWithComplete(
    filters?: FeedbackFilters,
    limit?: number,
    offset?: number,
    userId?: string
  ): Promise<{
    feedback: FeedbackWithUserAndTagsComplete[] | null;
    error: any;
    count?: number;
  }> {
    try {
      // QUERY 1: Fetch all feedback
      const {
        feedback,
        error: feedbackError,
        count,
      } = await this.getFeedback(filters, limit, offset);

      if (feedbackError) throw feedbackError;
      if (!feedback || feedback.length === 0) {
        return { feedback: [], error: null, count: 0 };
      }

      const feedbackIds = feedback.map((f) => f.id);
      const uniqueUserIds = [...new Set(feedback.map((f) => f.user_id))];

      // QUERY 2, 3, 4, 5, 6: Batch fetch all data in parallel
      const [usersResult, tagsResult, reactionsResult, commentsResult] =
        await Promise.all([
          // Fetch users
          supabase
            .from("users")
            .select("user_id, display_name, profile_picture")
            .in("user_id", uniqueUserIds),

          // Fetch tags
          supabase
            .from("feedback_tags")
            .select(
              `
              feedback_id,
              tags (
                id,
                name,
                description
              )
            `
            )
            .in("feedback_id", feedbackIds)
            .eq("is_deleted", false),

          // Fetch reactions with counts
          supabase
            .from("feedback_reactions")
            .select("feedback_id, user_id")
            .in("feedback_id", feedbackIds)
            .eq("is_deleted", false),

          // Fetch ALL comments (parents + replies) for all feedback
          supabase
            .from("feedback_comments")
            .select("*")
            .in("feedback_id", feedbackIds)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false }),
        ]);

      if (usersResult.error) throw usersResult.error;
      if (tagsResult.error) throw tagsResult.error;
      if (reactionsResult.error) throw reactionsResult.error;
      if (commentsResult.error) throw commentsResult.error;

      // Create user lookup map
      const usersMap = new Map(
        usersResult.data?.map((user) => [user.user_id, user]) || []
      );

      // Create tags map
      const tagsMap = new Map<string, any[]>();
      tagsResult.data?.forEach((item: any) => {
        if (item.tags) {
          if (!tagsMap.has(item.feedback_id)) {
            tagsMap.set(item.feedback_id, []);
          }
          tagsMap.get(item.feedback_id)?.push(item.tags);
        }
      });

      // Process reaction data
      const reactionsData = reactionsResult.data || [];
      const reactionsMap = new Map<
        string,
        { count: number; userHasLiked: boolean }
      >();

      feedbackIds.forEach((feedbackId) => {
        const feedbackReactions = reactionsData.filter(
          (r) => r.feedback_id === feedbackId
        );
        const count = feedbackReactions.length;
        const userHasLiked = userId
          ? feedbackReactions.some((r) => r.user_id === userId)
          : false;
        reactionsMap.set(feedbackId, { count, userHasLiked });
      });

      // Process comments data - group by feedback_id
      const allComments = commentsResult.data || [];
      const commentsByFeedback = new Map<string, typeof allComments>();
      allComments.forEach((comment) => {
        if (!commentsByFeedback.has(comment.feedback_id)) {
          commentsByFeedback.set(comment.feedback_id, []);
        }
        commentsByFeedback.get(comment.feedback_id)?.push(comment);
      });

      // Collect all comment IDs and user IDs from comments
      const allCommentIds = allComments.map((c) => c.id);
      const commentUserIds = new Set<string>(allComments.map((c) => c.user_id));

      // QUERY 7, 8: Fetch comment users and likes in parallel
      const [commentUsersResult, commentLikesResult] = await Promise.all([
        // Fetch users for comments
        supabase
          .from("users")
          .select("user_id, display_name, profile_picture")
          .in("user_id", Array.from(commentUserIds)),

        // Fetch comment likes
        allCommentIds.length > 0
          ? supabase
              .from("feedback_comments_likes")
              .select("comment_id, user_id")
              .in("comment_id", allCommentIds)
              .eq("is_deleted", false)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (commentUsersResult.error) throw commentUsersResult.error;
      if (commentLikesResult.error) throw commentLikesResult.error;

      // Create comment users map
      const commentUsersMap = new Map(
        commentUsersResult.data?.map((user) => [user.user_id, user]) || []
      );

      // Process comment likes data
      const commentLikesData = commentLikesResult.data || [];
      const commentLikesMap = new Map<
        string,
        { likeCount: number; userHasLiked: boolean }
      >();

      allCommentIds.forEach((commentId) => {
        const commentLikes = commentLikesData.filter(
          (l) => l.comment_id === commentId
        );
        const likeCount = commentLikes.length;
        const userHasLiked = userId
          ? commentLikes.some((l) => l.user_id === userId)
          : false;
        commentLikesMap.set(commentId, { likeCount, userHasLiked });
      });

      // Helper function to build nested comment structure for a feedback
      const buildCommentsForFeedback = (
        feedbackId: string
      ): FeedbackCommentWithUserComplete[] => {
        const feedbackComments = commentsByFeedback.get(feedbackId) || [];

        // Separate parent comments and replies
        const parentComments = feedbackComments.filter(
          (c) => c.parent_comment_id === null
        );
        const allReplies = feedbackComments.filter(
          (c) => c.parent_comment_id !== null
        );

        // Build replies map
        const repliesMap = new Map<string, typeof allReplies>();
        allReplies.forEach((reply) => {
          const parentId = reply.parent_comment_id!;
          if (!repliesMap.has(parentId)) {
            repliesMap.set(parentId, []);
          }
          repliesMap.get(parentId)?.push(reply);
        });

        // Recursive function to build nested replies
        const buildNestedReplies = (
          parentId: string
        ): FeedbackCommentWithUserComplete[] => {
          const directReplies = repliesMap.get(parentId) || [];

          return directReplies.map((reply) => {
            const replyUserData = commentUsersMap.get(reply.user_id);
            const replyLikeData = commentLikesMap.get(reply.id);
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

        // Build parent comments with nested replies
        return parentComments.map((comment) => {
          const userData = commentUsersMap.get(comment.user_id);
          const likeData = commentLikesMap.get(comment.id);
          const directReplies = repliesMap.get(comment.id) || [];
          const nestedReplies = buildNestedReplies(comment.id);

          return {
            ...comment,
            user: userData || undefined,
            like_count: likeData?.likeCount || 0,
            user_has_liked: likeData?.userHasLiked || false,
            replies: nestedReplies,
            reply_count: directReplies.length, // Only count direct replies
          };
        });
      };

      // Build final structure with all data
      const feedbackWithComplete: FeedbackWithUserAndTagsComplete[] =
        feedback.map((fb) => {
          const reactionData = reactionsMap.get(fb.id) || {
            count: 0,
            userHasLiked: false,
          };
          const comments = buildCommentsForFeedback(fb.id);
          const totalCommentCount = commentsByFeedback.get(fb.id)?.length || 0;

          return {
            ...fb,
            user: usersMap.get(fb.user_id) || undefined,
            tags: tagsMap.get(fb.id) || [],
            reaction_count: reactionData.count,
            user_has_reacted: reactionData.userHasLiked,
            comment_count: totalCommentCount,
            comments: comments,
          };
        });

      return { feedback: feedbackWithComplete, error: null, count };
    } catch (error) {
      console.error("Error fetching complete feedback data:", error);
      return { feedback: null, error, count: 0 };
    }
  }
}

// Admin operations (using service role key)
export class FeedbackAdminService {
  // Force delete a feedback (bypasses RLS)
  static async forceDeleteFeedback(
    feedbackId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feedback")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feedback:", error);
      return { success: false, error };
    }
  }

  // Get all feedback as admin (bypasses RLS)
  static async getAllFeedbackAdmin(): Promise<{
    feedback: Feedback[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { feedback: data, error: null };
    } catch (error) {
      console.error("Error fetching all feedback as admin:", error);
      return { feedback: null, error };
    }
  }

  // Get deleted feedback as admin
  static async getDeletedFeedbackAdmin(): Promise<{
    feedback: Feedback[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback")
        .select("*")
        .eq("is_deleted", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return { feedback: data, error: null };
    } catch (error) {
      console.error("Error fetching deleted feedback as admin:", error);
      return { feedback: null, error };
    }
  }

  // Bulk delete feedback by user (admin only)
  static async bulkDeleteFeedbackByUser(
    userId: string
  ): Promise<{ success: boolean; deletedCount: number; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select();

      if (error) throw error;
      return {
        success: true,
        deletedCount: data?.length || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error bulk deleting feedback by user:", error);
      return { success: false, deletedCount: 0, error };
    }
  }

  // Bulk delete feedback by feature (admin only)
  static async bulkDeleteFeedbackByFeature(
    featureId: string
  ): Promise<{ success: boolean; deletedCount: number; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback")
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
      console.error("Error bulk deleting feedback by feature:", error);
      return { success: false, deletedCount: 0, error };
    }
  }
}

// Export default for convenience
export default FeedbackService;
