"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn-primary">
      <span>{pending ? "Adding..." : "Add a Ticket"}</span>
    </button>
  );
}
