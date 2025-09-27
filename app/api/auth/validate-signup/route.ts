import { NextRequest, NextResponse } from "next/server";
import { SupabaseAuth } from "../../../../lib/supabase-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();

    // Validate input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required and must be a string" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate display name if provided
    if (displayName !== undefined && typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Display name must be a string" },
        { status: 400 }
      );
    }

    // Check for existing users
    const validation = await SupabaseAuth.validateSignupData(
      email,
      displayName
    );

    return NextResponse.json({
      isValid: validation.isValid,
      errors: validation.errors,
    });
  } catch (error) {
    console.error("Error validating signup data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for convenience (with query params)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const displayName = searchParams.get("displayName");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for existing users
    const validation = await SupabaseAuth.validateSignupData(
      email,
      displayName || undefined
    );

    return NextResponse.json({
      isValid: validation.isValid,
      errors: validation.errors,
    });
  } catch (error) {
    console.error("Error validating signup data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
