import { supabase } from "../supabase";

// TypeScript interfaces for the email_subscriptions table
export interface EmailSubscription {
  id: string;
  subscribed_at: string;
  email: string;
  unsubscribed: boolean;
  unsubscribed_at: string | null;
  user_id: string | null;
}

export interface CreateEmailSubscriptionData {
  email: string;
  user_id?: string | null;
  unsubscribed?: boolean;
}

export interface UpdateEmailSubscriptionData {
  email?: string;
  unsubscribed?: boolean;
  unsubscribed_at?: string | null;
  user_id?: string | null;
}

// Email Subscription CRUD operations
export class EmailSubscriptionService {
  // Create a new email subscription
  static async createSubscription(
    subscriptionData: CreateEmailSubscriptionData
  ): Promise<{ subscription: EmailSubscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .insert([
          {
            ...subscriptionData,
            user_id: subscriptionData.user_id || null,
            unsubscribed: subscriptionData.unsubscribed ?? false,
            subscribed_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { subscription: data, error: null };
    } catch (error) {
      console.error("Error creating email subscription:", error);
      return { subscription: null, error };
    }
  }

  // Get a subscription by email
  static async getSubscriptionByEmail(
    email: string
  ): Promise<{ subscription: EmailSubscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;
      return { subscription: data, error: null };
    } catch (error) {
      console.error("Error fetching subscription by email:", error);
      return { subscription: null, error };
    }
  }

  // Get a subscription by ID
  static async getSubscriptionById(
    subscriptionId: string
  ): Promise<{ subscription: EmailSubscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .single();

      if (error) throw error;
      return { subscription: data, error: null };
    } catch (error) {
      console.error("Error fetching subscription by ID:", error);
      return { subscription: null, error };
    }
  }

  // Get all subscriptions (with optional pagination)
  static async getSubscriptions(
    limit?: number,
    offset?: number
  ): Promise<{
    subscriptions: EmailSubscription[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("email_subscriptions")
        .select("*", { count: "exact" })
        .order("subscribed_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { subscriptions: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return { subscriptions: null, error, count: 0 };
    }
  }

  // Get active subscriptions only (not unsubscribed)
  static async getActiveSubscriptions(
    limit?: number,
    offset?: number
  ): Promise<{
    subscriptions: EmailSubscription[] | null;
    error: any;
    count?: number;
  }> {
    try {
      let query = supabase
        .from("email_subscriptions")
        .select("*", { count: "exact" })
        .eq("unsubscribed", false)
        .order("subscribed_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { subscriptions: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching active subscriptions:", error);
      return { subscriptions: null, error, count: 0 };
    }
  }

  // Update a subscription
  static async updateSubscription(
    subscriptionId: string,
    updates: UpdateEmailSubscriptionData
  ): Promise<{ subscription: EmailSubscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .update(updates)
        .eq("id", subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return { subscription: data, error: null };
    } catch (error) {
      console.error("Error updating subscription:", error);
      return { subscription: null, error };
    }
  }

  // Unsubscribe by email
  static async unsubscribeByEmail(
    email: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .update({
          unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("email", email)
        .select()
        .single();

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error unsubscribing email:", error);
      return { success: false, error };
    }
  }

  // Delete a subscription (hard delete)
  static async deleteSubscription(
    subscriptionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from("email_subscriptions")
        .delete()
        .eq("id", subscriptionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error deleting subscription:", error);
      return { success: false, error };
    }
  }

  // Check if subscription exists (by email)
  static async subscriptionExists(
    email: string
  ): Promise<{ exists: boolean; isActive: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from("email_subscriptions")
        .select("unsubscribed")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        throw error;
      }

      return {
        exists: !!data,
        isActive: data ? !data.unsubscribed : false,
        error: null,
      };
    } catch (error) {
      console.error("Error checking subscription existence:", error);
      return { exists: false, isActive: false, error };
    }
  }

  // Get subscription count
  static async getSubscriptionCount(): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await supabase
        .from("email_subscriptions")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting subscription count:", error);
      return { count: 0, error };
    }
  }

  // Get active subscription count
  static async getActiveSubscriptionCount(): Promise<{
    count: number;
    error: any;
  }> {
    try {
      const { count, error } = await supabase
        .from("email_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("unsubscribed", false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error) {
      console.error("Error getting active subscription count:", error);
      return { count: 0, error };
    }
  }

  // Get subscriptions by user_id
  static async getSubscriptionsByUserId(
    userId: string
  ): Promise<{
    subscriptions: EmailSubscription[] | null;
    error: any;
    count?: number;
  }> {
    try {
      const { data, error, count } = await supabase
        .from("email_subscriptions")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return { subscriptions: data, error: null, count: count || 0 };
    } catch (error) {
      console.error("Error fetching subscriptions by user ID:", error);
      return { subscriptions: null, error, count: 0 };
    }
  }
}

// Admin operations (using service role key)
export class EmailSubscriptionAdminService {
  // Force delete a subscription (bypasses RLS)
  static async forceDeleteSubscription(
    subscriptionId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { error } = await supabaseAdmin
        .from("email_subscriptions")
        .delete()
        .eq("id", subscriptionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Error force deleting subscription:", error);
      return { success: false, error };
    }
  }

  // Get all subscriptions as admin (bypasses RLS)
  static async getAllSubscriptionsAdmin(): Promise<{
    subscriptions: EmailSubscription[] | null;
    error: any;
  }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("email_subscriptions")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return { subscriptions: data, error: null };
    } catch (error) {
      console.error("Error fetching all subscriptions as admin:", error);
      return { subscriptions: null, error };
    }
  }

  // Bulk unsubscribe by user_id (admin only)
  static async bulkUnsubscribeByUserId(
    userId: string
  ): Promise<{ success: boolean; unsubscribedCount: number; error: any }> {
    try {
      // Import supabaseAdmin only when needed
      const { supabaseAdmin } = await import("../supabase-server");

      const { data, error } = await supabaseAdmin
        .from("email_subscriptions")
        .update({
          unsubscribed: true,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select();

      if (error) throw error;
      return {
        success: true,
        unsubscribedCount: data?.length || 0,
        error: null,
      };
    } catch (error) {
      console.error("Error bulk unsubscribing by user ID:", error);
      return { success: false, unsubscribedCount: 0, error };
    }
  }
}

// Export default for convenience
export default EmailSubscriptionService;
