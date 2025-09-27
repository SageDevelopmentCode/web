import { supabase } from "./supabase";

// TypeScript interfaces for the users table
export interface User {
  user_id: string;
  created_at: string;
  updated_at: string;
  profile_picture?: string;
  // Add other user fields as needed based on your schema
}

export interface CreateUserData {
  user_id: string;
  profile_picture?: string;
  // Add other optional fields for user creation
}

export interface UpdateUserData {
  profile_picture?: string;
  updated_at?: string;
  // Add other updatable fields
}

// User CRUD operations
export class UserService {
  // Create a new user
  static async createUser(
    userData: CreateUserData
  ): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { user: data, error: null };
    } catch (error) {
      console.error("Error creating user:", error);
      return { user: null, error };
    }
  }

  // Get a user by ID
  static async getUserById(
    userId: string
  ): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return { user: data, error: null };
    } catch (error) {
      console.error("Error fetching user:", error);
      return { user: null, error };
    }
  }

  // Get all users (with optional pagination)
  static async getUsers(
    limit?: number,
    offset?: number
  ): Promise<{ users: User[] | null; error: any; count?: number }> {
    try {
      let query = supabase
        .from("users")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { users: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { users: null, error, count: 0 };
    }
  }

  // Update a user
  static async updateUser(
    userId: string,
    updates: UpdateUserData
  ): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { user: data, error: null };
    } catch (error) {
      console.error("Error updating user:", error);
      return { user: null, error };
    }
  }

  // Delete a user
  static async deleteUser(
    userId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error };
    }
  }

  // Check if user exists
  static async userExists(
    userId: string
  ): Promise<{ exists: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        throw error;
      }

      return { exists: !!data, error: null };
    } catch (error) {
      console.error("Error checking user existence:", error);
      return { exists: false, error };
    }
  }

  // Get user count
  static async getUserCount(): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting user count:", error);
      return { count: 0, error };
    }
  }

  // Search users by profile picture or user_id
  static async searchUsers(
    searchTerm: string
  ): Promise<{ users: User[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(
          `profile_picture.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { users: data, error: null };
    } catch (error) {
      console.error("Error searching users:", error);
      return { users: null, error };
    }
  }
}

// Admin operations (using service role key)
export class UserAdminService {
  // Force delete a user (bypasses RLS)
  static async forceDeleteUser(
    userId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("./supabase-server");

      const { error } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting user:", error);
      return { success: false, error };
    }
  }

  // Get all users as admin (bypasses RLS)
  static async getAllUsersAdmin(): Promise<{
    users: User[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("./supabase-server");

      const { data, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { users: data, error: null };
    } catch (error) {
      console.error("Error fetching all users as admin:", error);
      return { users: null, error };
    }
  }
}

// Export default for convenience
export default UserService;
