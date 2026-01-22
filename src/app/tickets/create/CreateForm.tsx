"use client";

import { useActionState } from "react";
import SubmitButton from "./SubmitButton";
import { addTicket } from "../actions";

const initialState = {
  message: "",
};

export default function CreateForm() {
  // 1. Initialize Action State
  const [state, formAction] = useActionState(addTicket, initialState);

  return (
    // 2. Point the form action to 'formAction'
    <form action={formAction} className="w-1/2">
      <label>
        <span>Title</span>
        <input type="text" required name="title" />
      </label>
      <label>
        <span>Body</span>
        <textarea required name="body" />
      </label>
      <label>
        <span>Priority:</span>
        <select name="priority">
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </label>

      <SubmitButton />

      {/* 3. Display the error message returned from the server */}
      {state.message && <div className="error mt-4">{state.message}</div>}
    </form>
  );
}
