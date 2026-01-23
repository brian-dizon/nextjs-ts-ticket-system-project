import { createBrowserClient } from "@supabase/ssr";

// 1. Export a function to create a Supabase client for the browser environment.
//    - WHAT: This function initializes a Supabase client specifically designed for client-side usage in Next.js.
//    - WHY: Client Components need to access Supabase features (like real-time subscriptions or direct database queries) directly from the user's browser.
//    - HOW (Enterprise): In large-scale apps, this is often used in a Singleton pattern or via a React Context provider to avoid recreating the client on every render, though `createBrowserClient` is lightweight enough to be called frequently.
export function createClient() {
  // 2. Return the initialized browser client.
  //    - WHAT: Calls the factory function with your project's URL and anonymous API key.
  //    - WHY: The client needs these credentials to connect to your specific Supabase project instance.
  //    - HOW (Enterprise): These environment variables (NEXT_PUBLIC_...) are exposed to the browser.
  //      Ensure strict Row Level Security (RLS) policies are in place on the database because this key is visible to anyone inspecting the client-side code.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}