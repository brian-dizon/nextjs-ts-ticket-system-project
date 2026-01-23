import Link from "next/link";
import { Suspense } from "react";
import TicketList from "./TicketList";
import Loading from "../loading";

// 1. Define the Tickets page as a Server Component.
//    - WHAT: This is the main listing page for tickets (`/tickets`).
//    - WHY: It acts as a "shell" or container for the ticket data.
//    - HOW (Enterprise): By separating the Page layout from the Data Fetching component (`TicketList`), we can use React Suspense to provide a better user experience.
export default function Tickets() {
  return (
    <main>
      {/* 2. Navigation Header.
          - WHAT: Displays the title and a link to the creation form.
      */}
      <nav>
        <div>
          <h2>Tickets</h2>
          <p>
            <small>Currently open tickets.</small>
          </p>
        </div>
        <Link href="/tickets/create" className="ml-auto">
          <button className="btn-primary">New Ticket</button>
        </Link>
      </nav>

      {/* 3. The Suspense Boundary.
          - WHAT: `Suspense` is a built-in React component.
          - WHY: `TicketList` is an async component that fetches data. Instead of making the user wait for the whole page to load, Next.js will show the `fallback` (your loading spinner) immediately and then "stream" in the `TicketList` once the database responds.
          - HOW (Enterprise): This is called "Streaming SSR". It makes the app feel much faster because the user sees the page header instantly while the data is still being fetched.
      */}
      <Suspense fallback={<Loading />}>
        <TicketList />
      </Suspense>
    </main>
  );
}