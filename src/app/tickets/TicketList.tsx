import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

// 1. Define TicketList as an async Server Component.
//    - WHAT: This component is responsible for fetching and displaying the list of tickets.
//    - WHY: Fetching data on the server is more secure (API keys/tokens aren't exposed) and faster (direct connection to the DB).
//    - HOW (Enterprise): This component is "stateless" regarding the UI. It just gets data and renders it. If the data changes, the server re-renders this component.
export default async function TicketList() {
  // 2. Initialize the Server-Side Supabase Client.
  //    - WHAT: Uses the `server.ts` utility.
  //    - WHY: To authenticate the request using the user's cookies.
  const supabase = await createClient();

  // 3. Query the Database.
  //    - WHAT: `supabase.from("tickets").select()` is equivalent to `SELECT * FROM tickets`.
  //    - WHY: To retrieve all rows from the `tickets` table.
  //    - HOW (Enterprise): Because we use the Server Client, Supabase automatically applies Row Level Security (RLS). 
  //      The user will only see tickets they are authorized to see, even though the code says "select all".
  const { data: tickets, error } = await supabase.from("tickets").select();

  // 4. Basic Error Handling.
  if (error) {
    console.log("Database Fetch Error: ", error.message);
  }

  return (
    <>
      {/* 5. Mapping the Data.
          - WHAT: We iterate over the `tickets` array and return a JSX "card" for each one.
          - WHY: This is the standard React way to render lists.
      */}
      {tickets?.map((ticket) => {
        return (
          <div key={ticket.id} className="card my-5">
            {/* 6. Dynamic Routing.
                - WHAT: Links to the individual ticket detail page using its ID.
                - WHY: Allows users to click into a specific record.
            */}
            <Link href={`/tickets/${ticket.id}`}>
              <h3>{ticket.title}</h3>
              {/* 7. Data Truncation.
                  - WHAT: `.slice(0, 200)` ensures the card doesn't get too long if the ticket body is huge.
              */}
              <p>{ticket.body.slice(0, 200)}...</p>
              
              {/* 8. Conditional Styling.
                  - WHAT: Using the `priority` value as a CSS class (e.g., "pill low", "pill high").
              */}
              <div className={`pill ${ticket.priority}`}>
                {ticket.priority} priority
              </div>
            </Link>
          </div>
        );
      })}

      {/* 9. Empty State Handling.
          - WHAT: Shows a friendly message if the database query returns an empty array.
      */}
      {tickets?.length === 0 && (
        <p className="text-center">There are no open tickets, yay!</p>
      )}
    </>
  );
}