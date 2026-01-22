"use client";

import { useTransition } from "react";
import { deleteTicket } from "../actions";
import { TiTrash } from "react-icons/ti";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button onClick={async (e) => await deleteTicket(id)} disabled={isPending} className="btn-primary">
      {isPending ? <>Deleting...</> : <TiTrash className="text-lg">Delete ticket</TiTrash>}
    </button>
  );
}
