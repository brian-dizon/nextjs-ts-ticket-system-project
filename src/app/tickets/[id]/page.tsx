import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import DeleteButton from "./DeleteButton";
import Link from "next/link";
import { TiEdit } from "react-icons/ti";

// 1. Helper function to fetch a single ticket.
//    - WHAT: Queries Supabase for a ticket matching the specific ID.
//    - WHY: To isolate the data-fetching logic from the UI component.
//    - HOW (Enterprise): `.single()` is used to ensure we only get one object back. If no ticket is found, we trigger `notFound()`, which sends the user to your custom 404 page.
const getTicket = async (id: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tickets")
    .select()
    .eq("id", id)
    .single();

  if (!data) notFound();
  return data;
};

// 2. Define the Dynamic Detail Page.
//    - WHAT: This page handles URLs like `/tickets/123`.
//    - ARGS: `params` is a Promise containing the ID from the URL.
//    - HOW (Enterprise): In Next.js 15, `params` is asynchronous and must be awaited before accessing properties.
export default async function TicketDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 3. Extract the ID and Fetch Data.
  const { id } = await params;
  const ticket = await getTicket(id);

  // 4. Authenticate the user.
  //    - WHAT: Check who is currently viewing the page.
  //    - WHY: We need to know if the viewer is the "Owner" of the ticket.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main>
      <nav>
        <h2>Ticket Details</h2>
        
        {/* 5. Authorization Check (Conditional Rendering).
            - WHAT: Compare the current user's email with the ticket creator's email.
            - WHY: Security. We only show the "Edit" and "Delete" buttons to the person who created the ticket.
            - HOW (Enterprise): This is "Front-end Authorization". Even if someone inspects the code, the Server Actions (CRUD) we documented earlier will still double-check this on the back-end for total safety.
        */}
        {user?.email === ticket.user_email && (
          <div className="ml-auto flex gap-2">
            <Link href={`/tickets/edit/${ticket.id}`}>
              <button className="btn-secondary">
                <TiEdit /> Edit
              </button>
            </Link>
            
            {/* 6. The Delete Client Component.
                - WHAT: We pass the ID to the client-side delete button.
            */}
            <DeleteButton id={ticket.id} />
          </div>
        )}
      </nav>

      {/* 7. Ticket Content Display. */}
      <div className="card">
        <h3>{ticket.title}</h3>
        <small>Created by {ticket.user_email}</small>
        <p>{ticket.body}</p>
        <div className={`pill ${ticket.priority}`}>
          {ticket.priority} priority
        </div>
      </div>
    </main>
  );
}