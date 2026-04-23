import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import { formatDate, formatTimeRange } from "@/lib/utils";
import { isAdmin } from "@/lib/auth";

export default async function EventsPage() {
  const supabase = await createClient();
  const admin = await isAdmin();

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_date, start_time, end_time, venue, capacity, invite_only")
    .order("event_date")
    .order("start_time");

  // RSVP counts per event
  const { data: rsvpRows } = await supabase.from("invitations").select("event_id, status");
  const counts: Record<string, { accepted: number; total: number }> = {};
  for (const r of rsvpRows ?? []) {
    counts[r.event_id] ??= { accepted: 0, total: 0 };
    counts[r.event_id].total++;
    if (r.status === "accepted") counts[r.event_id].accepted++;
  }

  const rows = events ?? [];

  return (
    <>
      <PageHeader
        eyebrow={`${rows.length} ${rows.length === 1 ? "event" : "events"}`}
        title="Events"
        subtitle="All events across IAF 2027 week. Click any event to view its guest list."
        actions={admin && <LinkButton href="/events/new">+ Add event</LinkButton>}
      />

      <div className="border border-neutral-200 overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium text-right">Confirmed</th>
              <th className="px-4 py-3 font-medium text-right">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No events yet.
                </td>
              </tr>
            ) : (
              rows.map((e) => {
                const c = counts[e.id] ?? { accepted: 0, total: 0 };
                return (
                  <tr key={e.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-3 align-top whitespace-nowrap text-neutral-700">
                      <div>{formatDate(e.event_date)}</div>
                      <div className="text-xs text-neutral-500">
                        {formatTimeRange(e.start_time, e.end_time)}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link href={`/events/${e.id}`} className="font-medium hover:underline">
                        {e.name}
                      </Link>
                      {e.invite_only && (
                        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-0.5">
                          Invite-only
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-neutral-700">{e.venue ?? "—"}</td>
                    <td className="px-4 py-3 align-top text-right tabular-nums font-medium">
                      {c.accepted}
                      <span className="text-neutral-400"> / {c.total}</span>
                    </td>
                    <td className="px-4 py-3 align-top text-right tabular-nums text-neutral-700">
                      {e.capacity ?? "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
