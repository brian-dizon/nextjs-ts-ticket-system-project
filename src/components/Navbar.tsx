import Link from "next/link";

//components
import { createClient } from "@/utils/supabase/server";
import LogOutButton from "./LogOutButton";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <nav>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">D</div>
        <h1>Dojo HelpDesk</h1>
      </div>
      <NavLinks />
      {user && (
        <div className="flex items-center gap-4">
          <span>Hello, {user.email}</span>
          <LogOutButton />
        </div>
      )}
      {!user && (
        <div className="flex items-center gap-4">
          <Link href="/login">Login</Link>
          <Link href="/signup">Sign up</Link>
        </div>
      )}
    </nav>
  );
}
