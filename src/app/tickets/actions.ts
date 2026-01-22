"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// utils
import { createClient } from "@/utils/supabase/server";

// define the state type
export type FormState = {
  message: string;
};

export async function addTicket(prevState: FormState, formData: FormData): Promise<FormState> {
  const ticket = Object.fromEntries(formData);

  const supabase = await createClient();

  // 1. Get  current user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to create a ticket." };
  }
  // 2. Insert the data
  const { error, data } = await supabase
    .from("tickets")
    .insert({ ...ticket, user_email: user?.email })
    .select();

  if (error) {
    return { message: "Could not create a ticket. Error: " + error.message };
  }

  revalidatePath("/tickets");
  redirect("/tickets");

  return { message: "Success. Ticket has been created." };
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

export async function updateTicket(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const ticket = Object.fromEntries(formData);
  const supabase = await createClient();

  // 1. Get current user (security check)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to update a ticket." };
  }

  console.log("user", user);

  // 2. Update the data - check "user_email" to ensure ownership
  const { error } = await supabase.from("tickets").update({ title: ticket.title, body: ticket.body, priority: ticket.priority }).eq("id", id).eq("user_email", user.email).select();

  if (error) {
    return { message: "Could not update ticket: " + error.message };
  }

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
  redirect("/tickets");

  return { message: "Success: Ticket has been updated." };
}
