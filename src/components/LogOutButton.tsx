"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// 1. Define the LogOutButton as a Client Component.
//    - WHAT: This component must be a Client Component because it handles a click event and uses the `useRouter` hook.
//    - WHY: Sign-out is an interactive action that requires communicating with the Supabase Auth API from the browser.
//    - HOW (Enterprise): This button is usually placed in a Navbar or Profile menu. Using a client-side logout provides a smooth user experience without a full page reload.
export default function LogOutButton() {
  const router = useRouter();

  // 2. Define the Logout Handler.
  //    - WHAT: An asynchronous function that triggers the Supabase sign-out process.
  const handleLogOut = async () => {
    // 2a. Initialize Browser-Side Supabase Client.
    const supabase = createClient();

    // 2b. Call the Sign-Out API.
    //     - WHAT: Tells Supabase to invalidate the current session.
    //     - WHY: To securely end the user's session.
    //     - HOW (Enterprise): The Supabase client automatically handles clearing the auth cookies/tokens from the browser's storage after a successful `signOut()` call.
    const { error } = await supabase.auth.signOut();

    // 3. Handle Results.
    if (!error) {
      // 3a. Success Case.
      //     - WHAT: Redirect the user back to the login page.
      //     - CRITICAL: `router.refresh()` is used here to force Next.js to re-validate the current page and layout.
      //       Since the auth cookie is now gone, Server Components (like the Navbar) will re-run, see that the user is null, and hide protected UI elements immediately.
      router.push("/login");
      router.refresh(); 
    }

    if (error) {
      // 3b. Error Case.
      //     - WHAT: Log the error for debugging. In a more complex app, you might show a toast notification here.
      console.log("Error logging out: ", error.message);
    }
  };

  return (
    // 4. Render the Button.
    //    - WHAT: A simple button that triggers the `handleLogOut` function on click.
    <button className="btn-secondary" onClick={handleLogOut}>
      Logout
    </button>
  );
}