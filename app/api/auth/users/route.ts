import { NextRequest, NextResponse } from "next/server";
import { SupabaseAuth } from "../../../../lib/supabase-auth";

/**
 * GET /api/auth/users
 * Returns all user emails and display names (admin only)
 * This endpoint should be protected in production
 */
export async function GET(request: NextRequest) {
  try {
    // In production, you should add authentication/authorization checks here
    // For example, check if the requesting user is an admin

    const result = await SupabaseAuth.getAllUserEmailsAndDisplayNames();

    if (result.error) {
      console.error("Error fetching users:", result.error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: result.users,
      count: result.users.length,
    });
  } catch (error) {
    console.error("Error in users API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
