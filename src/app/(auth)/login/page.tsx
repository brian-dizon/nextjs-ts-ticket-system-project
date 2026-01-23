"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthForm from "../AuthForm";
import { createClient } from "@/utils/supabase/client";

// 1. Define the Login component as a Client Component.
//    - WHAT: The `"use client"` directive at the top tells Next.js to render this on the user's browser.
//    - WHY: Authentication forms require interactivity (handling input, button clicks, and state).
//    - HOW (Enterprise): Client-side authentication is common for SPAs or hybrid apps to provide instant feedback (like loading spinners) without a page refresh.
export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  // 2. Define the Form Submission Handler.
  //    - WHAT: This function is passed to the `AuthForm` and runs when the user clicks "Submit".
  //    - WHY: It centralizes the authentication logic for the login page.
  const handleSubmit = async (e: React.FormEvent, email: string, password: string) => {
    // 2a. Prevent default browser behavior.
    //     - WHAT: Stops the page from refreshing when the form is submitted.
    e.preventDefault();
    setError("");

    // 2b. Initialize the Browser-Side Supabase Client.
    //     - WHAT: Uses the utility from `client.ts`.
    //     - WHY: Since we are in a "use client" file, we use the browser client to talk directly to Supabase from the user's computer.
    const supabase = createClient();

    // 2c. Attempt to Sign In.
    //     - WHAT: Calls the Supabase Auth API with the provided credentials.
    //     - WHY: To verify the user and receive a session token (stored automatically in cookies by the client).
    //     - HOW (Enterprise): Supabase handles the heavy lifting of password hashing and security checks.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 3. Handle Authentication Results.
    if (error) {
      // 3a. Display Error.
      //     - WHAT: If login fails, we show the message from Supabase (e.g., "Invalid login credentials").
      setError(error.message);
    }

    if (!error) {
      // 3b. Redirect and Sync State.
      //     - WHAT: Send the user to the home page (`/`).
      //     - WHY: To enter the dashboard.
      //     - CRITICAL: `router.refresh()` is used to tell Next.js to re-fetch the Server Components. 
      //       Since the user is now logged in, the Navbar and other server-side parts need to update to show the "Logout" button instead of "Login".
      router.push("/");
      router.refresh(); 
    }
  };

  return (
    <main>
      <h2 className="text-center">Login</h2>
      
      {/* 4. Render the Shared Form Component.
          - WHAT: We pass our specific `handleSubmit` logic into the generic `AuthForm`.
          - WHY: Code reuse. This same form UI can be used for both Login and Signup.
      */}
      <AuthForm handleSubmit={handleSubmit} />
      
      {/* 5. Conditional Error Rendering.
          - WHAT: Only shows the error paragraph if the `error` state is not empty.
      */}
      {error && <p className="error">{error}</p>}
    </main>
  );
}