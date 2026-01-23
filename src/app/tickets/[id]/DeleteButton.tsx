"use client";

import { useTransition } from "react";
import { deleteTicket } from "../actions";
import { TiTrash } from "react-icons/ti";

// 1. Define the DeleteButton as a Client Component.
//    - WHAT: This component handles the interactive "Delete" action.
//    - WHY: It needs to manage a loading state (`isPending`) while the server deletes the data.
export default function DeleteButton({ id }: { id: string }) {
  // 2. Initialize the Transition Hook.
  //    - WHAT: `useTransition` allows us to track the status of a Server Action.
  //    - RETURNS:
  //        - `isPending`: Becomes `true` while the action is running.
  //        - `startTransition`: A function used to wrap the server call.
  //    - HOW (Enterprise): This is better than `useState` for loading because it stays in sync with Next.js's background navigation and cache revalidation.
  const [isPending, startTransition] = useTransition();

  return (
    // 3. Trigger the Delete Action.
    //    - WHAT: When clicked, we wrap the `deleteTicket` call in `startTransition`.
    //    - WHY: This tells React to treat the deletion as a "transition", which automatically toggles the `isPending` state.
    <button onClick={() => startTransition(() => deleteTicket(id))} disabled={isPending} className="btn-primary">
      {/* 4. Dynamic Button Label.
          - WHAT: Swaps the Trash icon for a "Deleting..." text when the request is active.
      */}
      {isPending ? (
        <>Deleting...</>
      ) : (
        <>
          <TiTrash className="text-lg" />
        </>
      )}
    </button>
  );
}
