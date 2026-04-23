"use client";

import { useTransition } from "react";
import { deleteEvent } from "../actions";

export default function DeleteEventButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (!confirm(`Delete ${name}? All invitations for this event will be removed.`)) return;
        startTransition(async () => {
          await deleteEvent(id);
        });
      }}
      disabled={isPending}
      className="text-sm text-rose-700 hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete event"}
    </button>
  );
}
