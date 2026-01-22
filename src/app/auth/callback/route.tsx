import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Parse the incoming URL request
  // @param "request.url" is the full url string
  const { searchParams, origin } = new URL(request.url);

  // 2. Extract the "code" (OTC supabase generated) query parameter
  const code = searchParams.get("code");

  // 3. Extract the "next" query parameter
  // "??" --- Nullish Coalescing Operator; It is a logical operator that returns the right-hand side operand when the left-hand side operand is null or undefined. Otherwise, it returns the left-hand side operand.
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // 4. Init SS Supabase Client
    const supabase = await createClient();

    // 5. Sends the code back to Supabase to verify
    // if valid code - sets a cookie in the user's browser
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 6. Success case
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 7. Error case
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
