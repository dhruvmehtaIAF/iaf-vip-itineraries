"use client";

import { useState, useTransition } from "react";
import type { UserRole } from "@/lib/types";
import { setUserRole } from "./actions";

export default function UserRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}) {
  const [current, setCurrent] = useState<UserRole>(role);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        value={current}
        disabled={disabled || isPending}
        onChange={(e) => {
          const next = e.target.value as UserRole;
          const prev = current;
          setCurrent(next);
          setError(null);
          startTransition(async () => {
            try {
              await setUserRole(userId, next);
            } catch (err) {
              setCurrent(prev);
              setError(err instanceof Error ? err.message : "Error");
            }
          });
        }}
        className="h-9 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900 disabled:opacity-60"
      >
        <option value="admin">Admin</option>
        <option value="viewer">Viewer</option>
      </select>
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </div>
  );
}
