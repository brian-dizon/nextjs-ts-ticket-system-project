"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthForm from "../AuthForm";
import { createClient } from "@/utils/supabase/client";

// 1. Define the SignUp component as a Client Component.
//    - WHAT: Similar to Login, this runs in the browser.
//    - WHY: It handles the account creation process which requires user input and asynchronous communication with Supabase.
//    - HOW (Enterprise): Sign-up pages often include more complex logic than login, such as loading states and specific redirect URLs for email verification.
export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Define the Sign-Up Submission Handler.
  //    - WHAT: Processes the account creation request.
  const handleSubmit = async (e: React.FormEvent, email: string, password: string) => {
    // 2a. UI Preparation.
    //     - WHAT: Prevents refresh, clears old errors, and sets a loading state.
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 2b. Initialize Browser-Side Supabase Client.
    const supabase = createClient();

    // 2c. Call the Sign-Up API.
    //     - WHAT: Creates a new user record in Supabase Auth.
    //     - WHY: To register a new user.
    //     - HOW (Enterprise): Notice the `emailRedirectTo`. In production, after a user clicks the link in their confirmation email, they are sent to this URL. 
    //       This "Callback" route is crucial for converting their temporary session into a permanent one in the browser.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // 3. Handle Results.
    if (error) {
      // 3a. Error handling.
      setError(error.message);
      setIsLoading(false);
    }
    
    if (!error) {
      // 3b. Successful signup redirection.
      //     - WHAT: Redirects to a `/verify` page (which usually tells the user to "Check your inbox").
      //     - WHY: Because we haven't confirmed their email yet, they are not yet fully "logged in" in the traditional sense.
      router.push("/verify");
    }
  };

  return (
    <main>
      <h2 className="text-center">Sign Up</h2>

      {/* 4. Visual Feedback (Loading State).
          - WHAT: We dim the form and disable clicks while the request is pending.
          - WHY: Prevents the user from clicking "Submit" multiple times (Double-Submit prevention).
      */}
      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <AuthForm handleSubmit={handleSubmit} />
      </div>

      {/* 5. Error and Loading Messages. */}
      {error && <div className="error">{error}</div>}
      {isLoading && <p className="text-center mt-4">Signing you up. Please wait...</p>}
    </main>
  );
}