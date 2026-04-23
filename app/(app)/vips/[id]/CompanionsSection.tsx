"use client";

import { useRef, useTransition } from "react";
import { addCompanion, removeCompanion } from "../actions";
import type { Companion } from "@/lib/types";

export default function CompanionsSection({
  vipId,
  companions,
  admin,
}: {
  vipId: string;
  companions: Companion[];
  admin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="border border-neutral-200 p-5">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-4">
        Companions ({companions.length})
      </h3>

      {companions.length === 0 ? (
        <p className="text-sm text-neutral-400 mb-3">No companions listed.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {companions.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <div>
                <div className="font-medium">{c.full_name}</div>
                {c.notes && <div className="text-xs text-neutral-500">{c.notes}</div>}
              </div>
              {admin && (
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await removeCompanion(vipId, c.id);
                    })
                  }
                  className="text-xs text-neutral-400 hover:text-rose-700 px-2 py-1 border border-transparent hover:border-rose-200"
                  disabled={isPending}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {admin && (
        <form
          ref={formRef}
          action={async (fd) => {
            await addCompanion(vipId, fd);
            formRef.current?.reset();
          }}
          className="flex flex-col gap-2 pt-4 border-t border-neutral-200"
        >
          <input
            name="full_name"
            placeholder="Companion name"
            className="h-9 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
            required
          />
          <input
            name="notes"
            placeholder="Notes (optional)"
            className="h-9 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-9 bg-neutral-900 text-white text-sm font-medium hover:bg-white hover:text-neutral-900 border border-neutral-900 transition-colors"
          >
            Add companion
          </button>
        </form>
      )}
    </div>
  );
}
