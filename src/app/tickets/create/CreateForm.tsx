"use client";

import { useActionState } from "react";
import SubmitButton from "./SubmitButton";
import { addTicket } from "../actions";

// 1. Define the Initial State for the form action.
//    - WHAT: An object containing a message string that starts empty.
//    - WHY: Server Actions return data back to the client. This object structure ensures we can capture and display success or error messages from the server.
const initialState = {
  message: "",
};

// 2. Define the CreateForm as a Client Component.
//    - WHAT: Since it uses hooks (`useActionState`) and handles user input, it must be client-side.
//    - WHY: To provide a reactive experience, like showing a loading state on the button or displaying error messages without a full page refresh.
export default function CreateForm() {
  
  // 3. Initialize the Action State Hook.
  //    - WHAT: `useActionState` connects a Server Action (`addTicket`) to the form.
  //    - RETURNS: 
  //        - `state`: The data returned from the server (initially `initialState`).
  //        - `formAction`: A special function we pass to the `<form>` element.
  //    - HOW (Enterprise): This is the preferred way to handle forms in Next.js 15+. It handles the "pending" state automatically and works even if JavaScript is slow to load (Progressive Enhancement).
  const [state, formAction] = useActionState(addTicket, initialState);

  return (
    // 4. Connect the Form to the Server Action.
    //    - WHAT: Instead of an `onSubmit` handler, we use the `action` prop.
    //    - WHY: Next.js handles the POST request to the server automatically. You don't need to write `fetch()` or `axios()` calls.
    <form action={formAction} className="w-1/2">
      
      {/* 5. Input Fields with 'name' attributes.
          - CRITICAL: Every input MUST have a `name` attribute (e.g., name="title").
          - WHY: Server Actions use the standard `FormData` API. The `name` is the key the server uses to find the data (e.g., formData.get('title')).
      */}
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

      {/* 6. The Submit Button.
          - WHAT: A separate component that knows how to show a "Saving..." state.
          - WHY: Keeping it separate allows it to use the `useFormStatus` hook internally.
      */}
      <SubmitButton />

      {/* 7. Server Feedback.
          - WHAT: Displays the message returned by the `addTicket` action.
          - WHY: If the server-side validation fails (e.g., "Title too short"), the user needs to know why.
      */}
      {state.message && <div className="error mt-4">{state.message}</div>}
    </form>
  );
}