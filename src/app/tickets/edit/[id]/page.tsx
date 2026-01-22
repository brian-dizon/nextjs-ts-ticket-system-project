import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import EditTicketForm from "./EditForm";

const getTicket = async (id: string) => {
  const supabase = await createClient();

  const { data } = await supabase.from("tickets").select().eq("id", id).single();

  if (!data) notFound();
  return data;
};

export default async function EditTicket({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getTicket(id);

  // verify ownership
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //   console.log("Ticket Owner:", ticket?.user_email);
  //   console.log("Current User:", user?.email);

  if (user?.email !== ticket.user_email) {
    return (
      <main className="text-center">
        <h2>You do not own this ticket.</h2>
      </main>
    );
  }

  return (
    <main>
      <h2 className="text-primary text-center">Edit Ticket</h2>
      <EditTicketForm ticket={ticket} />
    </main>
  );
}
