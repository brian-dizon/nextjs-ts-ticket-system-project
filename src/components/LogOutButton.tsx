"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LogOutButton() {
  const router = useRouter();

  const handleLogOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/login");
      // optional: force a UI refresh
      router.refresh();
    }

    if (error) {
      console.log("Error logging out: ", error.message);
    }
  };

  return (
    <button className="btn-secondary" onClick={handleLogOut}>
      Logout
    </button>
  );
}
