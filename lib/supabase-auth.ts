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
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
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
      if (error) throw error;
      return session;
    } catch (error) {
      console.error("Error getting current session:", error);
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
}

export default SupabaseAuth;
