import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <main>
      <h2>Dashboard</h2>
      <p>Welcome to Dojo Helpdesk! Here you can manage your support tickets and view company updates.</p>

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
