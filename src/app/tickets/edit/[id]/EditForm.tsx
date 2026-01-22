"use client";

import { useActionState } from "react";
import { FormState, updateTicket } from "../../actions";
import SubmitButton from "../../create/SubmitButton";

const initialState: FormState = {
  message: "",
};

// define the shape of the ticket prop
interface Ticket {
  id: string;
  title: string;
  body: string;
  priority: string;
}

export default function EditTicketForm({ ticket }: { ticket: Ticket }) {
  // BINDING: We prefill the 'id' arg of updateTicket
  const updateTicketWithId = updateTicket.bind(null, ticket.id);

  const [state, formAction] = useActionState(updateTicketWithId, initialState);

  return (
    <form action={formAction} className="w-1/2">
      <label>
        <span>Title:</span>
        <input
          required
          type="text"
          name="title"
          defaultValue={ticket.title} // Pre-fill value
        />
      </label>
      <label>
        <span>Body:</span>
        <textarea
          required
          name="body"
          defaultValue={ticket.body} // Pre-fill value
        />
      </label>
      <label>
        <span>Priority:</span>
        <select
          name="priority"
          defaultValue={ticket.priority} // Pre-fill value
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </label>

      <SubmitButton />

      {state.message && <div className="error mt-4">{state.message}</div>}
    </form>
  );
}
