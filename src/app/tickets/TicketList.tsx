import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function TicketList() {
  const supabase = await createClient();

  const { data: tickets, error } = await supabase.from("tickets").select();

  if (error) console.log(error.message);

  return (
    <>
      {tickets?.map((ticket) => {
        return (
          <div key={ticket.id} className="card my-5">
            <Link href={`/tickets/${ticket.id}`}>
              <h3>{ticket.title}</h3>
              <p>{ticket.body.slice(0, 200)}...</p>
              <div className={`pill ${ticket.priority}`}>{ticket.priority} priority</div>
            </Link>
          </div>
        );
      })}
      {tickets?.length === 0 && <p className="text-center">There are no open tickets, yay!</p>}
    </>
  );
}
