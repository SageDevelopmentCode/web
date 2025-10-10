import { supabase } from "../supabase";

// TypeScript interfaces for the tags table
export interface Tag {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
}

export interface CreateTagData {
  name: string;
  description?: string | null;
}

export interface UpdateTagData {
  name?: string;
  description?: string | null;
}

// Tags CRUD operations
export class TagsService {
  // Get all tags
  static async getAllTags(): Promise<{ tags: Tag[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return { tags: data, error: null };
    } catch (error) {
      console.error("Error fetching tags:", error);
      return { tags: null, error };
    }
  }

  // Get a tag by ID
  static async getTagById(
    tagId: string
  ): Promise<{ tag: Tag | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("id", tagId)
        .single();

      if (error) throw error;
      return { tag: data, error: null };
    } catch (error) {
      console.error("Error fetching tag:", error);
      return { tag: null, error };
    }
  }

  // Get a tag by name
  static async getTagByName(
    name: string
  ): Promise<{ tag: Tag | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("name", name)
        .single();

      if (error) throw error;
      return { tag: data, error: null };
    } catch (error) {
      console.error("Error fetching tag by name:", error);
      return { tag: null, error };
    }
  }

  // Search tags by name (partial match)
  static async searchTags(
    searchTerm: string
  ): Promise<{ tags: Tag[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .order("name", { ascending: true });

      if (error) throw error;
      return { tags: data, error: null };
    } catch (error) {
      console.error("Error searching tags:", error);
      return { tags: null, error };
    }
  }

  // Get tags by IDs (batch fetch)
  static async getTagsByIds(
    tagIds: string[]
  ): Promise<{ tags: Tag[] | null; error: any }> {
    try {
      if (!tagIds || tagIds.length === 0) {
        return { tags: [], error: null };
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .in("id", tagIds)
        .order("name", { ascending: true });

      if (error) throw error;
      return { tags: data, error: null };
    } catch (error) {
      console.error("Error fetching tags by IDs:", error);
      return { tags: null, error };
    }
  }

  // Get total tags count
  static async getTotalTagsCount(): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("tags")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting total tags count:", error);
      return { count: 0, error };
    }
  }

  // Create a new tag (admin only - typically)
  static async createTag(
    tagData: CreateTagData
  ): Promise<{ tag: Tag | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("tags")
        .insert([
          {
            name: tagData.name,
            description: tagData.description || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { tag: data, error: null };
    } catch (error) {
      console.error("Error creating tag:", error);
      return { tag: null, error };
    }
  }

  // Update a tag (admin only - typically)
  static async updateTag(
    tagId: string,
    updates: UpdateTagData
  ): Promise<{ tag: Tag | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("tags")
        .update(updates)
        .eq("id", tagId)
        .select()
        .single();

      if (error) throw error;
      return { tag: data, error: null };
    } catch (error) {
      console.error("Error updating tag:", error);
      return { tag: null, error };
    }
  }

  // Delete a tag (admin only - typically)
  static async deleteTag(
    tagId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("tags").delete().eq("id", tagId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting tag:", error);
      return { success: false, error };
    }
  }
}

// Admin operations (using service role key)
export class TagsAdminService {
  // Get all tags as admin (bypasses RLS)
  static async getAllTagsAdmin(): Promise<{ tags: Tag[] | null; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return { tags: data, error: null };
    } catch (error) {
      console.error("Error fetching all tags as admin:", error);
      return { tags: null, error };
    }
  }

  // Force delete a tag (bypasses RLS)
  static async forceDeleteTag(
    tagId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting tag:", error);
      return { success: false, error };
    }
  }

  // Bulk create tags (admin only)
  static async bulkCreateTags(
    tagsData: CreateTagData[]
  ): Promise<{ tags: Tag[] | null; count: number; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const tagsToInsert = tagsData.map((tag) => ({
        name: tag.name,
        description: tag.description || null,
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabaseAdmin
        .from("tags")
        .insert(tagsToInsert)
        .select();

      if (error) throw error;
      return { tags: data, count: data?.length || 0, error: null };
    } catch (error) {
      console.error("Error bulk creating tags:", error);
      return { tags: null, count: 0, error };
    }
  }
}

// Export default for convenience
export default TagsService;
