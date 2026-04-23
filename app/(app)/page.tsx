import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import { formatDate, formatTimeRange, RSVP_LABELS } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import type { RsvpStatus } from "@/lib/types";

type InvitationWithJoins = {
  status: RsvpStatus;
  event: { id: string; name: string; event_date: string } | null;
  vip: { id: string; full_name: string } | null;
};

type EventRow = {
  id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  capacity: number | null;
};

const STATUSES: RsvpStatus[] = [
  "accepted",
  "tentative",
  "invited",
  "waitlist",
  "declined",
  "not_sent",
];

export default async function Dashboard() {
  const supabase = await createClient();

  const [vipsRes, eventsRes, invitationsRes, recentRes] = await Promise.all([
    supabase.from("vips").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id, name, event_date, start_time, end_time, venue, capacity")
      .order("event_date")
      .order("start_time"),
    supabase.from("invitations").select("event_id, status, companions_attending"),
    supabase
      .from("invitations")
      .select("status, event:events(id,name,event_date), vip:vips(id,full_name)")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const vipCount = vipsRes.count ?? 0;
  const events = (eventsRes.data ?? []) as EventRow[];
  const invitations = invitationsRes.data ?? [];
  const recent = (recentRes.data ?? []) as unknown as InvitationWithJoins[];

  // Per-event RSVP bucketing
  type EventCounts = {
    accepted: number;
    tentative: number;
    invited: number;
    waitlist: number;
    declined: number;
    not_sent: number;
    confirmed_heads: number; // accepted VIPs + their companions
  };
  const byEvent = new Map<string, EventCounts>();
  for (const i of invitations) {
    const bucket =
      byEvent.get(i.event_id) ??
      { accepted: 0, tentative: 0, invited: 0, waitlist: 0, declined: 0, not_sent: 0, confirmed_heads: 0 };
    bucket[i.status as RsvpStatus] = (bucket[i.status as RsvpStatus] ?? 0) + 1;
    if (i.status === "accepted") {
      bucket.confirmed_heads += 1 + (i.companions_attending ?? 0);
    }
    byEvent.set(i.event_id, bucket);
  }

  const totalConfirmed = invitations.filter((i) => i.status === "accepted").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events.filter(
    (e) => new Date(e.event_date + "T00:00:00") >= today
  );

  return (
    <>
      <PageHeader
        eyebrow="IAF 2027"
        title="Dashboard"
        subtitle="Live view of VIPs, events, and RSVP status across the fair."
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200 mb-12">
        <Stat label="VIPs" value={vipCount} href="/vips" />
        <Stat label="Events" value={events.length} href="/events" />
        <Stat label="Invitations" value={invitations.length} />
        <Stat label="Confirmed" value={totalConfirmed} />
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="iaf-display text-3xl">Upcoming Events — RSVP Status</h2>
          <Link href="/events" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
            See all events →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <p className="text-neutral-500 text-sm border border-dashed border-neutral-300 px-4 py-8 text-center">
            No upcoming events. <Link href="/events/new" className="underline">Add one →</Link>
          </p>
        ) : (
          <div className="border border-neutral-200 overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  {STATUSES.map((s) => (
                    <th key={s} className="px-3 py-3 font-medium text-center whitespace-nowrap">
                      {RSVP_LABELS[s]}
                    </th>
                  ))}
                  <th className="px-3 py-3 font-medium text-right whitespace-nowrap">Heads</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((e) => {
                  const c = byEvent.get(e.id) ?? {
                    accepted: 0, tentative: 0, invited: 0, waitlist: 0, declined: 0, not_sent: 0, confirmed_heads: 0,
                  };
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
                        {e.venue && (
                          <div className="text-xs text-neutral-500 truncate max-w-xs">{e.venue}</div>
                        )}
                      </td>
                      {STATUSES.map((s) => (
                        <td
                          key={s}
                          className={`px-3 py-3 align-top text-center tabular-nums ${
                            c[s] === 0 ? "text-neutral-300" : "text-neutral-900 font-semibold"
                          }`}
                        >
                          {c[s]}
                        </td>
                      ))}
                      <td className="px-3 py-3 align-top text-right tabular-nums whitespace-nowrap">
                        <span className="font-bold">{c.confirmed_heads}</span>
                        {e.capacity && (
                          <span className="text-neutral-400"> / {e.capacity}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-xs text-neutral-500">
          <strong>Heads</strong> = confirmed VIPs + their attending companions (the number to plan catering for).
        </p>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="iaf-display text-3xl mb-6">Recent RSVP Activity</h2>
          <div className="border border-neutral-200">
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 last:border-b-0 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge status={r.status} />
                  <span className="font-medium truncate">{r.vip?.full_name}</span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-600 truncate">{r.event?.name}</span>
                </div>
                <span className="text-xs text-neutral-500 hidden sm:inline">
                  {r.event?.event_date ? formatDate(r.event.event_date) : ""}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const body = (
    <div className="bg-white px-5 py-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
        {label}
      </div>
      <div className="iaf-display text-5xl tabular-nums">{value}</div>
    </div>
  );
  return href ? (
    <Link href={href} className="hover:bg-neutral-50 transition-colors">
      {body}
    </Link>
  ) : (
    body
  );
}
