"use client";

import { useActionState } from "react";
import { FormState, updateTicket } from "../../actions";
import SubmitButton from "../../create/SubmitButton";

const initialState: FormState = {
  message: "",
};

// 1. Define the Ticket interface for TypeScript.
interface Ticket {
  id: string;
  title: string;
  body: string;
  priority: string;
}

// 2. Define the EditTicketForm Client Component.
//    - WHAT: A form that pre-fills data and calls the `updateTicket` server action.
export default function EditTicketForm({ ticket }: { ticket: Ticket }) {
  
  // 3. The "Binding" Pattern.
  //    - WHAT: `updateTicket.bind(null, ticket.id)` creates a NEW version of the function that always has the `ticket.id` as its first argument.
  //    - WHY: Server Actions in `useActionState` expect a specific signature (prevState, formData). By binding the ID here, the server-side function gets `(id, prevState, formData)`.
  //    - HOW (Enterprise): This is the standard way to pass "hidden" IDs to server actions without using hidden input fields in the HTML, which is cleaner and more secure.
  const updateTicketWithId = updateTicket.bind(null, ticket.id);

  // 4. Initialize Action State.
  const [state, formAction] = useActionState(updateTicketWithId, initialState);

  return (
    <form action={formAction} className="w-1/2">
      
      {/* 5. Pre-filling with `defaultValue`.
          - WHAT: We use `defaultValue` instead of `value`.
          - WHY: In React, `defaultValue` sets the initial content but allows the user to type freely without needing an `onChange` handler for every keypress.
          - HOW (Enterprise): This is a "Uncontrolled Component" pattern. It is much more performant for large forms because the component doesn't re-render on every keystroke.
      */}
      <label>
        <span>Title:</span>
        <input
          required
          type="text"
          name="title"
          defaultValue={ticket.title} 
        />
      </label>

      <label>
        <span>Body:</span>
        <textarea
          required
          name="body"
          defaultValue={ticket.body}
        />
      </label>

      <label>
        <span>Priority:</span>
        <select
          name="priority"
          defaultValue={ticket.priority}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </label>

      {/* 6. Shared Submit Button.
          - WHAT: Reuses the same button component from the 'create' flow.
      */}
      <SubmitButton />

      {/* 7. Display Server Results. */}
      {state.message && <div className="error mt-4">{state.message}</div>}
    </form>
  );
}