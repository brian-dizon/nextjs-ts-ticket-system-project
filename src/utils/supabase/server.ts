import { createServerClient } from "@supabase/ssr"; // --> Its primary job is to create a Supabase client that is "state-aware" within the Next.js server environment. Server Components cannot access localStorage.

import { cookies } from "next/headers"; // --> cookies() is an asynchronous function that returns a RequestCookies or ReadonlyRequestCookies object.

export async function createClient() {
  // function call that returns an object and ready to use
  // returns a Promise must use 'await'
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {}
      },
    },
  });
}
