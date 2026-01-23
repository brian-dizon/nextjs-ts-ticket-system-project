"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// 1. Define the State Type.
//    - WHAT: A TypeScript type that describes the object returned by the server action.
//    - WHY: This ensures type safety when the `useActionState` hook in the client receives the result.
export type FormState = {
  message: string;
};

// 2. The 'addTicket' Server Action.
//    - WHAT: This function is triggered by the CreateForm.
//    - ARGS:
//        - `prevState`: The previous result of the action (required by useActionState).
//        - `formData`: The native browser FormData object containing input values.
//    - HOW (Enterprise): Server Actions are secure because they run exclusively on the server. No one can see this logic in the browser.
export async function addTicket(prevState: FormState, formData: FormData): Promise<FormState> {
  // 2a. Convert FormData to a plain object.
  //     - WHAT: Turns [ ['title', 'My Ticket'], ... ] into { title: 'My Ticket', ... }.
  const ticket = Object.fromEntries(formData);

  // 2b. Initialize Server-Side Supabase Client.
  const supabase = await createClient();

  // 2c. Security Check: Get the user.
  //     - WHAT: Verifies who is making the request.
  //     - WHY: Even if the user is "logged in" in the browser, we must re-verify on the server for every mutation.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 2d. Guard Clause.
  if (!user) {
    return { message: "You must be logged in to create a ticket." };
  }

  // 2e. Insert into Database.
  //     - WHAT: Saves the new record to the 'tickets' table.
  //     - WHY: We manually attach `user_email` from the secure server session to ensure the user can't "spoof" someone else's email in the form.
  const { error } = await supabase
    .from("tickets")
    .insert({ ...ticket, user_email: user?.email })
    .select();

  if (error) {
    return { message: "Could not create a ticket. Error: " + error.message };
  }

  // 2f. Cache Management.
  //     - WHAT: Tells Next.js to purge the cached version of the '/tickets' page.
  //     - WHY: Without this, the user would redirect back to the list and NOT see their new ticket because the page was cached.
  revalidatePath("/tickets");

  // 2g. Navigation.
  //     - WHAT: Send the user back to the list.
  redirect("/tickets");

  return { message: "Success. Ticket has been created." };
}

// 3. The 'deleteTicket' Server Action.
//    - WHAT: Deletes a specific record.
//    - HOW (Enterprise): Notice we check BOTH the `id` AND the `user_email`. This is "Defense in Depth". 
//      Even if a hacker knows a ticket ID, they can't delete it unless they are logged in as the owner.
export async function deleteTicket(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", id)
    .eq("user_email", user?.email); // Security: Only delete if ID matches AND current user owns it.

  if (!error) {
    revalidatePath("/tickets");
    redirect("/tickets");
  }
}

// 4. The 'updateTicket' Server Action.
//    - WHAT: Modifies an existing record.
export async function updateTicket(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const ticket = Object.fromEntries(formData);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to update a ticket." };
  }

  // 4a. Update Database.
  const { error } = await supabase
    .from("tickets")
    .update({ 
      title: ticket.title, 
      body: ticket.body, 
      priority: ticket.priority 
    })
    .eq("id", id)
    .eq("user_email", user.email) // Security: Ensure only the owner can update.
    .select();

  if (error) {
    return { message: "Could not update ticket: " + error.message };
  }

  // 4b. Multi-path Revalidation.
  //     - WHAT: We refresh both the list view and the individual detail view.
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
  
  redirect("/tickets");

  return { message: "Success: Ticket has been updated." };
}