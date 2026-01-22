import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import DeleteButton from "./DeleteButton";

const getTicket = async (id: string) => {
  const supabase = await createClient();

  const { data } = await supabase.from("tickets").select().eq("id", id).single();

  if (!data) notFound();
  return data;
};

export default async function TicketDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ticket = await getTicket(id);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("Ticket Owner:", ticket.user_email);
  console.log("Current User:", user?.email);

  return (
    <main>
      <nav>
        <h2>Ticket Details</h2>
        {user?.email === ticket.user_email && (
          <div className="ml-auto">
            <DeleteButton id={ticket.id} />
          </div>
        )}
      </nav>
      <div className="card">
        <h3>{ticket.title}</h3>
        <small>Created by {ticket.user_email}</small>
        <p>{ticket.body}</p>
        <div className={`pill ${ticket.priority}`}>{ticket.priority} priority</div>
      </div>
    </main>
  );
}
