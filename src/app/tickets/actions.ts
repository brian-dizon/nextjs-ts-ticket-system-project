"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// utils
import { createClient } from "@/utils/supabase/server";

export async function addTicket(formData: FormData) {
  console.log("SERVER ACTION STARTED"); // Debug Log 1

  const ticket = Object.fromEntries(formData);
  console.log("Form Data:", ticket); // Debug Log 2

  const supabase = await createClient();

  // 1. Get  current user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth Error: ", authError);
    return;
  }

  console.log("User found:", user.email); // Debug Log 3

  // 2. Insert the data
  const { error, data } = await supabase
    .from("tickets")
    .insert({ ...ticket, user_email: user?.email })
    .select();

  // 3. Update the UI and redirect
  if (error) {
    console.error("Supabase Insert Error:", error); // Debug Log 4
  } else {
    console.log("Insert Success:", data); // Debug Log 5
    revalidatePath("/tickets");
    redirect("/tickets");
  }
}

export async function deleteTicket(id: string) {
  const supabase = await createClient();

  // 1. Get current user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("tickets").delete().eq("id", id).eq("user_email", user?.email);

  if (!error) {
    revalidatePath("/tickets");
    redirect("/tickets");
  }
}
