import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

// 1. Define the Home component as an async Server Component.
//    - WHAT: This is the root page of your application (`/`). By default, all files in the `app` directory are Server Components.
//    - WHY: Server Components run on the server, meaning they can fetch data and check authentication *before* sending any HTML to the user.
//    - HOW (Enterprise): This reduces "client-side layout shift" because the server decides if the user is allowed to see this content before the browser even starts rendering.
export default async function Home() {
  // 2. Initialize the Server-Side Supabase Client.
  //    - WHAT: Uses the utility we documented in `server.ts`.
  //    - WHY: We need to check if the current visitor has a valid session cookie.
  const supabase = await createClient();

  // 3. Retrieve the current session.
  //    - WHAT: `getSession()` checks the cookies for a valid JWT.
  //    - WHY: Unlike `getUser()`, `getSession()` is faster because it often relies on the local cookie data rather than a full database lookup.
  //    - NOTE: For highly sensitive data, `getUser()` is preferred. For simple page-level "is logged in?" checks, `getSession()` is common.
  // const {
  //   data: { session },
  // } = await supabase.auth.getSession();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 4. Server-Side Protection (Redirect).
  //    - WHAT: If no session exists, the user is not logged in.
  //    - WHY: We want to protect this "Dashboard" page.
  //    - HOW (Enterprise): Using `redirect()` on the server is extremely fast. The browser receives a 307 redirect status code and never even downloads the HTML for this page if they aren't authorized.
  if (!session) redirect("/login");

  // 5. Render the UI.
  //    - WHAT: Standard JSX for the dashboard view.
  //    - WHY: This only renders if the `if (!session)` check passed.
  return (
    <main>
      <h2>Dashboard</h2>
      <p>Welcome to Dojo Helpdesk! Here you can manage your support tickets and view company updates.</p>

      {/* 6. Navigation Link.
          - WHAT: The `Link` component from Next.js provides "client-side navigation".
          - WHY: It intercepts the click and loads the next page without a full browser refresh, making the app feel like a Single Page Application (SPA).
      */}
      <div className="flex justify-center my-8">
        <Link href="/tickets">
          <button className="btn-primary">View Tickets</button>
        </Link>
      </div>

      <h2>Company Updates</h2>
      <div className="card">
        <h3>New member of the web dev team...</h3>
        <p>We are thrilled to welcome a new senior developer to our team! They bring years of experience with React and Supabase.</p>
      </div>
      <div className="card">
        <h3>New website live!</h3>
        <p>Our updated portal is now live with better performance and a cleaner UI. Thanks for all the feedback during the beta.</p>
      </div>
    </main>
  );
}
