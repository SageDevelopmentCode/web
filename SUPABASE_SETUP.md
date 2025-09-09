# Supabase Setup Guide

This guide will help you connect your Next.js app to your Supabase database.

## 🔧 Environment Setup

1. **Create a `.env.local` file** in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service role key for server-side operations (keep secret)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

2. **Get your Supabase credentials**:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the Project URL and anon public key

## 📁 Files Created

- **`lib/supabase.ts`** - Main Supabase client for client-side operations
- **`lib/supabase-server.ts`** - Server-side client with elevated permissions
- **`lib/supabase-auth.ts`** - Authentication utilities and helpers
- **`lib/supabase-types.ts`** - TypeScript type definitions (update with your schema)

## 🚀 Usage Examples

### Basic Database Query

```typescript
import { supabase } from "@/lib/supabase";

// Fetch data
const { data, error } = await supabase.from("your_table").select("*");

// Insert data
const { data, error } = await supabase
  .from("your_table")
  .insert({ column: "value" });
```

### Authentication

```typescript
import SupabaseAuth from "@/lib/supabase-auth";

// Sign up
const { user, error } = await SupabaseAuth.signUp(
  "email@example.com",
  "password"
);

// Sign in
const { user, error } = await SupabaseAuth.signIn(
  "email@example.com",
  "password"
);

// Sign out
await SupabaseAuth.signOut();
```

### Server-side Operations (API Routes)

```typescript
import { supabaseAdmin } from "@/lib/supabase-server";

// This bypasses Row Level Security (RLS)
const { data, error } = await supabaseAdmin.from("your_table").select("*");
```

## 🔒 Security Notes

- **Never commit `.env.local`** to version control
- Use the `NEXT_PUBLIC_` prefix only for variables that are safe to expose to the client
- Keep your service role key secret - only use it in server-side code
- Enable Row Level Security (RLS) on your Supabase tables for data protection

## 📊 Type Generation

To generate TypeScript types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > lib/supabase-types.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

## 🔧 Next Steps

1. Add your environment variables to `.env.local`
2. Update `lib/supabase-types.ts` with your actual database schema types
3. Create API routes in `app/api/` for your database operations
4. Implement authentication flows in your components
5. Set up Row Level Security policies in your Supabase dashboard

Happy coding! 🎉
