"use client";

import { useTransition } from "react";
import { deleteVip } from "../actions";

export default function DeleteVipButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm(`Delete ${name}? This removes their invitations and companions too.`)) return;
        startTransition(async () => {
          await deleteVip(id);
        });
      }}
      disabled={isPending}
      className="text-sm text-rose-700 hover:underline disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete VIP"}
    </button>
  );
}
