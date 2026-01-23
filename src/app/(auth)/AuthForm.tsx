"use client";
import { useState } from "react";

// 1. Define the component and its "Props" (Arguments).
//    - WHAT: The component accepts a `handleSubmit` function from its parent (Login or Signup).
//    - WHY: This is a "Controlled Component". It handles the UI state (typing in boxes), but "lifts" the actual logic up to the parent.
//    - HOW (Enterprise): This pattern is called "Separation of Concerns". The Form doesn't care if it's logging in or signing up; it just knows how to collect an email and password and hand them off.
export default function AuthForm({ 
  handleSubmit 
}: { 
  handleSubmit: (e: React.FormEvent, email: string, password: string) => void 
}) {
  // 2. Local State Management.
  //    - WHAT: `useState` tracks what the user is currently typing.
  //    - WHY: In React, inputs are "Controlled". The value in the box is synced exactly to the state variable.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    // 3. Form Submission Handling.
    //    - WHAT: When the button is clicked, we call the `handleSubmit` function passed in as a prop.
    //    - WHY: We pass the local `email` and `password` states back to the parent component.
    <form onSubmit={(e) => handleSubmit(e, email, password)}>
      
      {/* 4. Email Input Field.
          - WHAT: A standard input with an `onChange` handler.
          - WHY: Every time the user types a character, `setEmail` updates the state.
      */}
      <label>
        <span>Email:</span>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </label>

      {/* 5. Password Input Field.
          - WHAT: A password-type input (hides characters).
          - WHY: Follows the same pattern as email.
      */}
      <label>
        <span>Password:</span>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </label>

      {/* 6. Submit Button.
          - WHAT: Clicking this triggers the `onSubmit` event of the `<form>`.
      */}
      <button className="btn-primary">Submit</button>
    </form>
  );
}