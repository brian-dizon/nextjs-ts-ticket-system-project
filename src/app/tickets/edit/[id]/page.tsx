import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import EditTicketForm from "./EditForm";

// 1. Fetch Ticket Data Helper.
//    - WHAT: Retrieves the specific ticket from the database.
//    - WHY: We need the existing data to pre-fill the edit form.
const getTicket = async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("tickets").select().eq("id", id).single();
  if (!data) notFound();
  return data;
};

// 2. Define the Edit Ticket Page as a Server Component.
//    - WHAT: The page that hosts the editing interface (`/tickets/edit/[id]`).
export default async function EditTicket({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 3. Resolve Dynamic Route Parameters.
  const { id } = await params;
  const ticket = await getTicket(id);

  // 4. Server-Side Security Verification (Authorization).
  //    - WHAT: Fetches the current user and compares their email with the ticket owner's email.
  //    - WHY: To prevent users from editing tickets they don't own by manually typing an ID in the URL.
  //    - HOW (Enterprise): This is a crucial security barrier. Even if the UI shows an "Edit" button, this server check ensures unauthorized access is blocked at the entry point.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email !== ticket.user_email) {
    return (
      <main className="text-center">
        <h2>Unauthorized</h2>
        <p>You do not have permission to edit this ticket.</p>
      </main>
    );
  }

  return (
    <main>
      <h2 className="text-primary text-center">Edit Ticket</h2>
      
      {/* 5. Pass Data to the Form.
          - WHAT: We send the existing `ticket` object as a prop to the client component.
          - WHY: The client form needs these values to show the user what they are currently editing.
      */}
      <EditTicketForm ticket={ticket} />
    </main>
  );
}