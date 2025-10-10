import { supabase } from "../supabase";
import { Tag } from "./tags";

// TypeScript interfaces for the feedback_tags junction table
export interface FeedbackTag {
  id: string;
  created_at: string;
  is_deleted: boolean;
  updated_at: string;
  tag_id: string;
  feedback_id: string;
  user_id: string;
}

export interface CreateFeedbackTagData {
  feedback_id: string;
  tag_id: string;
  user_id: string;
}

// Extended feedback tag with tag details
export interface FeedbackTagWithDetails extends FeedbackTag {
  tag?: Tag;
}

// Feedback Tags CRUD operations
export class FeedbackTagsService {
  // Add multiple tags to a feedback post
  static async addTagsToFeedback(
    feedbackId: string,
    tagIds: string[],
    userId: string
  ): Promise<{ feedbackTags: FeedbackTag[] | null; error: any }> {
    try {
      if (!tagIds || tagIds.length === 0) {
        return { feedbackTags: [], error: null };
      }

      const feedbackTagsData = tagIds.map((tagId) => ({
        feedback_id: feedbackId,
        tag_id: tagId,
        user_id: userId,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("feedback_tags")
        .insert(feedbackTagsData)
        .select();

      if (error) throw error;
      return { feedbackTags: data, error: null };
    } catch (error) {
      console.error("Error adding tags to feedback:", error);
      return { feedbackTags: null, error };
    }
  }

  // Add a single tag to a feedback post
  static async addTagToFeedback(
    feedbackId: string,
    tagId: string,
    userId: string
  ): Promise<{ feedbackTag: FeedbackTag | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_tags")
        .insert([
          {
            feedback_id: feedbackId,
            tag_id: tagId,
            user_id: userId,
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { feedbackTag: data, error: null };
    } catch (error) {
      console.error("Error adding tag to feedback:", error);
      return { feedbackTag: null, error };
    }
  }

  // Remove a tag from a feedback post (soft delete)
  static async removeTagFromFeedback(
    feedbackId: string,
    tagId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feedback_tags")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("feedback_id", feedbackId)
        .eq("tag_id", tagId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error removing tag from feedback:", error);
      return { success: false, error };
    }
  }

  // Get all tags for a specific feedback post
  static async getTagsForFeedback(
    feedbackId: string
  ): Promise<{ tags: Tag[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_tags")
        .select(
          `
          tag_id,
          tags (
            id,
            name,
            description,
            created_at
          )
        `
        )
        .eq("feedback_id", feedbackId)
        .eq("is_deleted", false);

      if (error) throw error;

      // Extract tags from the joined data
      const tags = data?.map((item: any) => item.tags).filter(Boolean) || [];
      return { tags, error: null };
    } catch (error) {
      console.error("Error fetching tags for feedback:", error);
      return { tags: null, error };
    }
  }

  // Get all feedback IDs that have a specific tag
  static async getFeedbackIdsByTagId(
    tagId: string
  ): Promise<{ feedbackIds: string[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("feedback_tags")
        .select("feedback_id")
        .eq("tag_id", tagId)
        .eq("is_deleted", false);

      if (error) throw error;

      const feedbackIds = data?.map((item) => item.feedback_id) || [];
      return { feedbackIds, error: null };
    } catch (error) {
      console.error("Error fetching feedback by tag:", error);
      return { feedbackIds: null, error };
    }
  }

  // Update all tags for a feedback post (replace existing tags)
  static async updateFeedbackTags(
    feedbackId: string,
    tagIds: string[],
    userId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // First, soft delete all existing tags for this feedback
      const { error: deleteError } = await supabase
        .from("feedback_tags")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("feedback_id", feedbackId)
        .eq("is_deleted", false);

      if (deleteError) throw deleteError;

      // Then add the new tags
      if (tagIds && tagIds.length > 0) {
        const { error: addError } = await this.addTagsToFeedback(
          feedbackId,
          tagIds,
          userId
        );
        if (addError) throw addError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error updating feedback tags:", error);
      return { success: false, error };
    }
  }

  // Get tag count for a feedback post
  static async getTagCountForFeedback(
    feedbackId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback_tags")
        .select("*", { count: "exact", head: true })
        .eq("feedback_id", feedbackId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting tag count for feedback:", error);
      return { count: 0, error };
    }
  }

  // Get feedback count for a tag
  static async getFeedbackCountForTag(
    tagId: string
  ): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback_tags")
        .select("*", { count: "exact", head: true })
        .eq("tag_id", tagId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting feedback count for tag:", error);
      return { count: 0, error };
    }
  }

  // Check if a feedback has a specific tag
  static async feedbackHasTag(
    feedbackId: string,
    tagId: string
  ): Promise<{ hasTag: boolean; error: any }> {
    try {
      const { count, error } = await supabase
        .from("feedback_tags")
        .select("*", { count: "exact", head: true })
        .eq("feedback_id", feedbackId)
        .eq("tag_id", tagId)
        .eq("is_deleted", false);

      if (error) throw error;
      return { hasTag: (count || 0) > 0, error: null };
    } catch (error) {
      console.error("Error checking if feedback has tag:", error);
      return { hasTag: false, error };
    }
  }

  // Hard delete a feedback tag (permanent removal)
  static async hardDeleteFeedbackTag(
    feedbackId: string,
    tagId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("feedback_tags")
        .delete()
        .eq("feedback_id", feedbackId)
        .eq("tag_id", tagId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error hard deleting feedback tag:", error);
      return { success: false, error };
    }
  }
}

// Admin operations (using service role key)
export class FeedbackTagsAdminService {
  // Get all feedback tags including deleted ones
  static async getAllFeedbackTagsAdmin(): Promise<{
    feedbackTags: FeedbackTag[] | null;
    error: any;
  }> {
    try {
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_tags")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { feedbackTags: data, error: null };
    } catch (error) {
      console.error("Error fetching all feedback tags as admin:", error);
      return { feedbackTags: null, error };
    }
  }

  // Bulk delete all tags for a feedback (admin only)
  static async bulkDeleteTagsForFeedback(
    feedbackId: string
  ): Promise<{ success: boolean; deletedCount: number; error: any }> {
    try {
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("feedback_tags")
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
      console.error("Error bulk deleting tags for feedback:", error);
      return { success: false, deletedCount: 0, error };
    }
  }

  // Force delete all feedback tags for a tag (bypasses RLS)
  static async forceDeleteFeedbackTagsByTag(
    tagId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("feedback_tags")
        .delete()
        .eq("tag_id", tagId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting feedback tags by tag:", error);
      return { success: false, error };
    }
  }
}

// Export default for convenience
export default FeedbackTagsService;
