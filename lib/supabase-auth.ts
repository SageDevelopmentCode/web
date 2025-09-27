import { supabase } from "./supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

// Authentication utilities
export class SupabaseAuth {
  // Sign up with email and password
  static async signUp(
    email: string,
    password: string,
    displayName?: string,
    metadata?: Record<string, any>
  ) {
    try {
      const userMetadata = {
        display_name: displayName,
        ...metadata,
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: undefined, // Disable magic link redirect
        },
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error: error as AuthError };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      return { user: null, session: null, error: error as AuthError };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        // Only log errors that aren't related to missing sessions
        if (
          !error.message.includes("session") &&
          !error.message.includes("Auth session missing")
        ) {
          console.error("Error getting current user:", error);
        }
        throw error;
      }
      return user;
    } catch (error) {
      // Don't log session-related errors when user is simply not authenticated
      const errorMessage = error instanceof Error ? error.message : "";
      if (
        !errorMessage.includes("session") &&
        !errorMessage.includes("Auth session missing")
      ) {
        console.error("Error getting current user:", error);
      }
      return null;
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        // Only log errors that aren't related to missing sessions
        if (
          !error.message.includes("session") &&
          !error.message.includes("Auth session missing")
        ) {
          console.error("Error getting current session:", error);
        }
        throw error;
      }
      return session;
    } catch (error) {
      // Don't log session-related errors when user is simply not authenticated
      const errorMessage = error instanceof Error ? error.message : "";
      if (
        !errorMessage.includes("session") &&
        !errorMessage.includes("Auth session missing")
      ) {
        console.error("Error getting current session:", error);
      }
      return null;
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  // Update user metadata
  static async updateUser(updates: {
    email?: string;
    password?: string;
    displayName?: string;
    data?: Record<string, any>;
  }) {
    try {
      const userUpdates: any = {};

      if (updates.email) userUpdates.email = updates.email;
      if (updates.password) userUpdates.password = updates.password;

      if (updates.displayName || updates.data) {
        userUpdates.data = {
          ...(updates.data || {}),
          ...(updates.displayName && { display_name: updates.displayName }),
        };
      }

      const { data, error } = await supabase.auth.updateUser(userUpdates);
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  // Get user's display name from metadata
  static getUserDisplayName(user: User | null): string | null {
    if (!user || !user.user_metadata) return null;
    return user.user_metadata.display_name || null;
  }

  // Get current user with display name helper
  static async getCurrentUserWithDisplayName(): Promise<{
    user: User | null;
    displayName: string | null;
  }> {
    const user = await this.getCurrentUser();
    const displayName = this.getUserDisplayName(user);
    return { user, displayName };
  }

  // Check if email already exists (requires admin access)
  static async checkEmailExists(email: string): Promise<{
    exists: boolean;
    error: AuthError | null;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("./supabase-server");

      // Get all users and filter for the email
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) throw error;

      // Check if any user has the same email
      const exists = data.users.some(
        (user) => user.email && user.email.toLowerCase() === email.toLowerCase()
      );

      return {
        exists,
        error: null,
      };
    } catch (error) {
      console.error("Error checking email existence:", error);
      return {
        exists: false,
        error: error as AuthError,
      };
    }
  }

  // Check if display name already exists by querying user metadata
  static async checkDisplayNameExists(displayName: string): Promise<{
    exists: boolean;
    error: AuthError | null;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("./supabase-server");

      // Get all users and check their display names
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) throw error;

      // Check if any user has the same display name (case-insensitive)
      const exists = data.users.some((user) => {
        const userDisplayName = user.user_metadata?.display_name;
        return (
          userDisplayName &&
          userDisplayName.toLowerCase() === displayName.toLowerCase()
        );
      });

      return {
        exists,
        error: null,
      };
    } catch (error) {
      console.error("Error checking display name existence:", error);
      return {
        exists: false,
        error: error as AuthError,
      };
    }
  }

  // Get all user emails and display names (admin only)
  static async getAllUserEmailsAndDisplayNames(): Promise<{
    users: Array<{
      id: string;
      email: string;
      displayName: string | null;
      createdAt: string;
    }>;
    error: AuthError | null;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("./supabase-server");

      const { data, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) throw error;

      const users = data.users.map((user) => ({
        id: user.id,
        email: user.email || "",
        displayName: user.user_metadata?.display_name || null,
        createdAt: user.created_at,
      }));

      return {
        users,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching all users:", error);
      return {
        users: [],
        error: error as AuthError,
      };
    }
  }

  // Combined validation function for signup
  static async validateSignupData(
    email: string,
    displayName?: string
  ): Promise<{
    isValid: boolean;
    errors: {
      email?: string;
      displayName?: string;
    };
  }> {
    const errors: { email?: string; displayName?: string } = {};

    // Check email
    const emailCheck = await this.checkEmailExists(email);
    if (emailCheck.error) {
      errors.email = "Unable to verify email availability";
    } else if (emailCheck.exists) {
      errors.email = "An account with this email already exists";
    }

    // Check display name if provided
    if (displayName) {
      const displayNameCheck = await this.checkDisplayNameExists(displayName);
      if (displayNameCheck.error) {
        errors.displayName = "Unable to verify username availability";
      } else if (displayNameCheck.exists) {
        errors.displayName = "This username is already taken";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default SupabaseAuth;
