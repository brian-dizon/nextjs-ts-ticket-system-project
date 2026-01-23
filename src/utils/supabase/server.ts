import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 1. Export an async function to create a Supabase client for the server environment.
//    - WHAT: This function initializes a Supabase client capable of handling cookies in a Next.js server environment (Server Components, Server Actions, Route Handlers).
//    - WHY: Server-side code cannot access the browser's `localStorage` or `document.cookie` directly. This client bridges that gap by using Next.js's `cookies()` API to read/write the auth token.
//    - HOW (Enterprise): This is the standard entry point for all server-side data fetching and mutations. It ensures that the request is authenticated as the specific user making the request.
export async function createClient() {
  // 2. Await the Next.js cookies API.
  //    - WHAT: Retrieves the cookie store associated with the incoming request.
  //    - WHY: `cookies()` is an asynchronous function in newer Next.js versions and must be awaited to access the cookie data.
  const cookieStore = await cookies();

  // 3. Initialize and return the server client.
  //    - WHAT: Creates the Supabase client with a custom cookie handling strategy.
  //    - WHY: The default Supabase client expects a browser environment. We must override the cookie methods to use the Next.js server-side API.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 3a. Define the `getAll` method.
        //     - WHAT: Returns all cookies from the current request.
        //     - WHY: Supabase uses this to scan for the `sb-<project-id>-auth-token` to identify the logged-in user.
        //     - HOW (Enterprise): Critical for SSR (Server Side Rendering). It allows the server to render pages with user-specific data (e.g., "Welcome, Brian") before sending HTML to the browser.
        getAll() {
          return cookieStore.getAll();
        },
        // 3b. Define the `setAll` method.
        //     - WHAT: Sets (or deletes) cookies in the response headers.
        //     - WHY: When a user signs in, signs out, or refreshes a token, Supabase needs to update the browser's cookies.
        //     - HOW (Enterprise): This logic handles the "lifecycle" of the session.
        //       Note the `try/catch` block: In Server Components, writing cookies is not allowed (they are read-only).
        //       However, Middleware or Server Actions *can* write cookies. The try/catch silently ignores errors in Server Components while working correctly where allowed.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}