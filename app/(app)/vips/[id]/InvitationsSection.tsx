"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, RSVP_LABELS } from "@/lib/utils";
import type { RsvpStatus } from "@/lib/types";
import {
  inviteVipToEvent,
  removeInvitation,
  setCompanionsAttending,
  setInvitationStatus,
} from "@/app/(app)/invitations/actions";

type InvRow = {
  id: string;
  status: RsvpStatus;
  companions_attending: number;
  notes: string | null;
  event: {
    id: string;
    name: string;
    event_date: string;
  } | null;
};

type EventOption = { id: string; name: string; event_date: string };

const STATUSES: RsvpStatus[] = [
  "not_sent",
  "invited",
  "accepted",
  "declined",
  "tentative",
  "waitlist",
];

export default function InvitationsSection({
  vipId,
  invitations,
  allEvents,
  admin,
}: {
  vipId: string;
  invitations: InvRow[];
  allEvents: EventOption[];
  admin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [addEventId, setAddEventId] = useState("");

  const invitedIds = new Set(invitations.filter((i) => i.event).map((i) => i.event!.id));
  const available = allEvents.filter((e) => !invitedIds.has(e.id));

  const sorted = [...invitations].sort((a, b) =>
    (a.event?.event_date ?? "").localeCompare(b.event?.event_date ?? "")
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="iaf-display text-3xl">All Invitations</h2>
      </div>

      {admin && available.length > 0 && (
        <form
          action={async (fd) => {
            if (!addEventId) return;
            fd.set("vip_id", vipId);
            fd.set("event_id", addEventId);
            fd.set("status", "invited");
            await inviteVipToEvent(fd);
            setAddEventId("");
          }}
          className="flex items-center gap-2 mb-4"
        >
          <select
            value={addEventId}
            onChange={(e) => setAddEventId(e.target.value)}
            className="h-10 border border-neutral-200 px-2 text-sm flex-1 focus:outline-none focus:border-neutral-900"
          >
            <option value="">+ Invite to an event…</option>
            {available.map((e) => (
              <option key={e.id} value={e.id}>
                {formatDate(e.event_date)} — {e.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!addEventId}
            className="h-10 px-4 bg-neutral-900 text-white border border-neutral-900 text-sm hover:bg-white hover:text-neutral-900 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500 border border-dashed border-neutral-300 px-4 py-8 text-center">
          No invitations yet.
        </p>
      ) : (
        <div className="border border-neutral-200">
          {sorted.map((i) => (
            <div
              key={i.id}
              className="border-b border-neutral-200 last:border-b-0 p-4 grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center"
            >
              <div className="min-w-0">
                <Link href={`/events/${i.event?.id}`} className="font-medium hover:underline truncate block">
                  {i.event?.name}
                </Link>
                <div className="text-xs text-neutral-500">
                  {i.event ? formatDate(i.event.event_date) : "—"}
                </div>
              </div>

              {admin ? (
                <select
                  defaultValue={i.status}
                  disabled={isPending}
                  onChange={(e) =>
                    startTransition(async () => {
                      await setInvitationStatus(i.id, e.target.value as RsvpStatus, {
                        vipId,
                        eventId: i.event?.id,
                      });
                    })
                  }
                  className="h-9 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {RSVP_LABELS[s]}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={i.status} />
              )}

              {admin ? (
                <input
                  type="number"
                  min={0}
                  defaultValue={i.companions_attending}
                  disabled={isPending}
                  onBlur={(e) =>
                    startTransition(async () => {
                      await setCompanionsAttending(i.id, Number(e.target.value), {
                        vipId,
                        eventId: i.event?.id,
                      });
                    })
                  }
                  className="h-9 w-20 border border-neutral-200 px-2 text-sm text-center focus:outline-none focus:border-neutral-900"
                  title="Companions attending"
                />
              ) : (
                <span className="text-xs text-neutral-500 text-center w-20">
                  +{i.companions_attending}
                </span>
              )}

              {admin && (
                <button
                  onClick={() => {
                    if (!confirm("Remove this invitation?")) return;
                    startTransition(async () => {
                      await removeInvitation(i.id, { vipId, eventId: i.event?.id });
                    });
                  }}
                  disabled={isPending}
                  className="text-xs text-neutral-400 hover:text-rose-700 px-2 py-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
