"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { RSVP_LABELS } from "@/lib/utils";
import type { RsvpStatus, VipCategory, VipType } from "@/lib/types";
import {
  inviteVipToEvent,
  removeInvitation,
  setCompanionsAttending,
  setInvitationListNumber,
  setInvitationStatus,
} from "@/app/(app)/invitations/actions";

type Row = {
  id: string;
  status: RsvpStatus;
  companions_attending: number;
  list_number: number;
  notes: string | null;
  vip: {
    id: string;
    full_name: string;
    country: string | null;
    type: VipType;
    category: VipCategory;
    designation: string | null;
  } | null;
  status_label: string;
  type_label: string;
  category_label: string;
};

type VipOption = {
  id: string;
  full_name: string;
  country: string | null;
  type: VipType;
  category: VipCategory;
};

const STATUSES: RsvpStatus[] = [
  "not_sent",
  "invited",
  "accepted",
  "declined",
  "tentative",
  "waitlist",
];

// Lists you can pick from — extend if you ever need more than 5 waves.
const LIST_NUMBERS = [1, 2, 3, 4, 5];

export default function EventGuestList({
  eventId,
  rows,
  allVips,
  admin,
}: {
  eventId: string;
  rows: Row[];
  allVips: VipOption[];
  admin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<RsvpStatus | "all">("all");
  const [q, setQ] = useState("");
  const [addVipId, setAddVipId] = useState("");
  const [addList, setAddList] = useState("1");

  const invitedIds = new Set(rows.map((r) => r.vip?.id).filter(Boolean) as string[]);
  const available = allVips.filter((v) => !invitedIds.has(v.id));

  const visible = useMemo(
    () =>
      rows
        .filter((r) => (filter === "all" ? true : r.status === filter))
        .filter((r) =>
          q.trim() === ""
            ? true
            : r.vip?.full_name.toLowerCase().includes(q.trim().toLowerCase())
        )
        .sort((a, b) => (a.vip?.full_name ?? "").localeCompare(b.vip?.full_name ?? "")),
    [rows, filter, q]
  );

  // Group by list_number
  const grouped = useMemo(() => {
    const m = new Map<number, Row[]>();
    for (const r of visible) {
      const list = r.list_number ?? 1;
      if (!m.has(list)) m.set(list, []);
      m.get(list)!.push(r);
    }
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [visible]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="iaf-display text-3xl">Guest List</h2>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search guests…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 border border-neutral-200 px-3 text-sm w-52 focus:outline-none focus:border-neutral-900"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as RsvpStatus | "all")}
            className="h-9 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {RSVP_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {admin && available.length > 0 && (
        <form
          action={async (fd) => {
            if (!addVipId) return;
            fd.set("vip_id", addVipId);
            fd.set("event_id", eventId);
            fd.set("status", "invited");
            fd.set("list_number", addList);
            await inviteVipToEvent(fd);
            setAddVipId("");
          }}
          className="flex items-center gap-2 mb-6"
        >
          <select
            value={addVipId}
            onChange={(e) => setAddVipId(e.target.value)}
            className="h-10 border border-neutral-200 px-2 text-sm flex-1 focus:outline-none focus:border-neutral-900"
          >
            <option value="">+ Invite a VIP…</option>
            {available.map((v) => (
              <option key={v.id} value={v.id}>
                {v.full_name} {v.country ? `— ${v.country}` : ""}
              </option>
            ))}
          </select>
          <select
            value={addList}
            onChange={(e) => setAddList(e.target.value)}
            className="h-10 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
            title="Which invite wave"
          >
            {LIST_NUMBERS.map((n) => (
              <option key={n} value={n}>
                List {n}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!addVipId}
            className="h-10 px-4 bg-neutral-900 text-white border border-neutral-900 text-sm hover:bg-white hover:text-neutral-900 transition-colors disabled:opacity-50"
          >
            Invite
          </button>
        </form>
      )}

      {grouped.length === 0 ? (
        <p className="text-sm text-neutral-500 border border-dashed border-neutral-300 px-4 py-8 text-center">
          No guests match.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([listNumber, listRows]) => {
            const listCounts = listRows.reduce(
              (acc, r) => {
                acc[r.status] = (acc[r.status] ?? 0) + 1;
                acc.total += 1;
                return acc;
              },
              { total: 0, accepted: 0, invited: 0, declined: 0, tentative: 0, waitlist: 0, not_sent: 0 } as Record<string, number>
            );

            return (
              <div key={listNumber}>
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                  <h3 className="text-lg font-semibold tracking-tight">List {listNumber}</h3>
                  <p className="text-xs text-neutral-500 tabular-nums">
                    {listCounts.total} invited · {listCounts.accepted} accepted ·{" "}
                    {listCounts.tentative} tentative · {listCounts.invited} pending ·{" "}
                    {listCounts.declined} declined
                  </p>
                </div>

                <div className="border border-neutral-200 overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
                        <th className="px-4 py-3 font-medium">Guest</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-center">+1s</th>
                        {admin && <th className="px-4 py-3 font-medium">List</th>}
                        {admin && <th className="px-4 py-3 font-medium" />}
                      </tr>
                    </thead>
                    <tbody>
                      {listRows.map((r) => (
                        <tr key={r.id} className="border-b border-neutral-100 last:border-b-0">
                          <td className="px-4 py-3">
                            <Link
                              href={`/vips/${r.vip?.id}`}
                              className="font-medium hover:underline"
                            >
                              {r.vip?.full_name}
                            </Link>
                            {r.vip?.designation && (
                              <div className="text-xs text-neutral-500">{r.vip.designation}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-neutral-700">{r.type_label}</td>
                          <td className="px-4 py-3 text-neutral-700">{r.category_label}</td>
                          <td className="px-4 py-3">
                            {admin ? (
                              <select
                                defaultValue={r.status}
                                disabled={isPending}
                                onChange={(e) =>
                                  startTransition(async () => {
                                    await setInvitationStatus(r.id, e.target.value as RsvpStatus, {
                                      eventId,
                                      vipId: r.vip?.id,
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
                              <StatusBadge status={r.status} />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {admin ? (
                              <input
                                type="number"
                                min={0}
                                defaultValue={r.companions_attending}
                                disabled={isPending}
                                onBlur={(e) =>
                                  startTransition(async () => {
                                    await setCompanionsAttending(r.id, Number(e.target.value), {
                                      eventId,
                                      vipId: r.vip?.id,
                                    });
                                  })
                                }
                                className="h-9 w-16 border border-neutral-200 px-2 text-sm text-center focus:outline-none focus:border-neutral-900"
                              />
                            ) : (
                              <span className="text-neutral-700">+{r.companions_attending}</span>
                            )}
                          </td>
                          {admin && (
                            <td className="px-4 py-3">
                              <select
                                defaultValue={r.list_number}
                                disabled={isPending}
                                onChange={(e) =>
                                  startTransition(async () => {
                                    await setInvitationListNumber(r.id, Number(e.target.value), {
                                      eventId,
                                      vipId: r.vip?.id,
                                    });
                                  })
                                }
                                className="h-9 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
                              >
                                {LIST_NUMBERS.map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </td>
                          )}
                          {admin && (
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  if (!confirm("Remove this guest from the event?")) return;
                                  startTransition(async () => {
                                    await removeInvitation(r.id, {
                                      eventId,
                                      vipId: r.vip?.id,
                                    });
                                  });
                                }}
                                disabled={isPending}
                                className="text-xs text-neutral-400 hover:text-rose-700 px-2 py-1"
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
