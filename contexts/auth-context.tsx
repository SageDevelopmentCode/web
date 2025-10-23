"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import SupabaseAuth from "../lib/supabase-auth";
import { UserService } from "../lib/supabase/users";

interface AuthContextType {
  user: User | null;
  userProfile: { profile_picture?: string } | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{
    profile_picture?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user profile from users table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { user: profile, error } = await UserService.getUserById(userId);
      if (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
    }
  };

  // Check for existing user session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await SupabaseAuth.getCurrentUser();
        if (currentUser?.id) {
          await fetchUserProfile(currentUser.id);
        }
        setUser(currentUser);
      } catch (error) {
        // Don't log errors for missing sessions - this is expected when no one is signed in
        const errorMessage = error instanceof Error ? error.message : "";
        if (
          !errorMessage.includes("session") &&
          !errorMessage.includes("Auth session missing")
        ) {
          console.error("Error checking user session:", error);
        }
        // User remains null, which is correct for unsigned users
        setUser(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = SupabaseAuth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;

      if (newUser?.id) {
        await fetchUserProfile(newUser.id);
      } else {
        setUserProfile(null);
      }

      setUser(newUser);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await SupabaseAuth.signOut();
      // User state will be automatically updated through the auth state listener
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await SupabaseAuth.getCurrentUser();
      setUser(currentUser);
      if (currentUser?.id) {
        await fetchUserProfile(currentUser.id);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      // Don't log errors for missing sessions - this is expected when no one is signed in
      const errorMessage = error instanceof Error ? error.message : "";
      if (
        !errorMessage.includes("session") &&
        !errorMessage.includes("Auth session missing")
      ) {
        console.error("Error refreshing user:", error);
      }
      // Set user to null for session-related errors
      if (
        errorMessage.includes("session") ||
        errorMessage.includes("Auth session missing")
      ) {
        setUser(null);
        setUserProfile(null);
      } else {
        throw error;
      }
    }
  };

  const value = {
    user,
    userProfile,
    isLoading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
