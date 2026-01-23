import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 1. Define the Middleware Function.
//    - WHAT: This function runs *before* every request to your specific routes (defined in `config` below).
//    - WHY: It is the "Gatekeeper". It sits between the user's browser and your Server Components.
//    - HOW (Enterprise): This is the only place in the Next.js stack where we can intercept a request, check if the user's session is expired, refresh it, and update the cookies *before* the Server Components try to render.
export async function middleware(request: NextRequest) {
  // 2. Create an initial response object.
  //    - WHAT: We create a "continuation" response that says "allow this request to proceed".
  //    - WHY: We need a mutable object to attach updated cookies to. We can't modify the incoming `request` directly, so we prepare a `response` that we will return at the end.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 3. Initialize the Supabase Client (Middleware Edition).
  //    - WHAT: Creates a Supabase client specifically for the Edge Runtime.
  //    - WHY: Just like `server.ts`, this client needs to read/write cookies. However, Middleware has a unique limitation: it must write cookies to *both* the incoming Request (so the Server Components see the new token) AND the outgoing Response (so the Browser sees the new token).
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      // 3a. Read cookies from the incoming request.
      getAll() {
        return request.cookies.getAll();
      },
      // 3b. Write cookies to both Request and Response.
      //     - HOW (Enterprise): This is the "Cookie Dance".
      //       If Supabase refreshes the token (because it was old), it calls this `setAll`.
      //       We must manually sync the `request` (for the server) and `response` (for the browser).
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));

        // Re-create the response object to apply the updated request cookies.
        // This ensures the Server Components downstream receive the fresh session.
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        // Apply the new cookies to the outgoing response so they persist in the browser.
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // 4. Validate and Refresh Session.
  //    - WHAT: Calls `getUser()`.
  //    - WHY: This is the magic line.
  //       1. Ideally, it just checks if the user is logged in.
  //       2. CRITICALLY: If the Auth Token (JWT) is expired but a Refresh Token exists, this call triggers the `setAll` method above, rotating the tokens.
  //    - HOW (Enterprise): Without this, your users would get randomly logged out after 1 hour (default JWT expiry). This keeps them logged in by silently refreshing their session in the background.
  //    - SECURITY NOTE: We use `getUser()` instead of `getSession()` because `getUser()` validates the token against the Supabase database (safer), whereas `getSession()` just blindly trusts the local cookie.
  await supabase.auth.getUser();

  // 5. Return the response.
  //    - WHAT: Passes the request (possibly with new cookies) down to the next stage (your Page/Layout).
  return response;
}

// 6. Middleware Configuration.
//    - WHAT: Tells Next.js which paths should trigger this middleware.
//    - WHY: Performance. We don't want to run the heavy Supabase client logic on static assets like images or fonts.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth callback routes)
     * - images/svgs (pattern matching at the end)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*) ",
  ],
};
