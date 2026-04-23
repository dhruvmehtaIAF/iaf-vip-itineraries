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

export default async function Dashboard() {
  const supabase = await createClient();

  const [vipsRes, eventsRes, invitationsRes, recentRes] = await Promise.all([
    supabase.from("vips").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id, name, event_date, start_time, end_time, venue").order("event_date"),
    supabase.from("invitations").select("status"),
    supabase
      .from("invitations")
      .select("status, event:events(id,name,event_date), vip:vips(id,full_name)")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const vipCount = vipsRes.count ?? 0;
  const events = eventsRes.data ?? [];
  const invitations = invitationsRes.data ?? [];
  const recent = (recentRes.data ?? []) as unknown as InvitationWithJoins[];

  const counts: Record<string, number> = {
    accepted: 0, invited: 0, declined: 0, tentative: 0, waitlist: 0, not_sent: 0,
  };
  for (const i of invitations) counts[i.status] = (counts[i.status] ?? 0) + 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter((e) => new Date(e.event_date + "T00:00:00") >= today)
    .slice(0, 5);

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
        <Stat label="Confirmed" value={counts.accepted} />
      </section>

      <section className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="iaf-display text-3xl mb-6">RSVP Breakdown</h2>
          <div className="border border-neutral-200">
            {(["accepted", "tentative", "invited", "waitlist", "declined", "not_sent"] as RsvpStatus[]).map(
              (s) => (
                <div
                  key={s}
                  className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 last:border-b-0"
                >
                  <StatusBadge status={s} />
                  <span className="text-2xl font-bold tabular-nums tracking-tight">
                    {counts[s] ?? 0}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h2 className="iaf-display text-3xl mb-6">Upcoming Events</h2>
          {upcoming.length === 0 ? (
            <p className="text-neutral-500 text-sm">
              No upcoming events. <Link href="/events/new" className="underline">Add one →</Link>
            </p>
          ) : (
            <ul className="border border-neutral-200">
              {upcoming.map((e) => (
                <li key={e.id} className="border-b border-neutral-200 last:border-b-0">
                  <Link
                    href={`/events/${e.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-neutral-50"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-widest text-neutral-500">
                        {formatDate(e.event_date)} · {formatTimeRange(e.start_time, e.end_time)}
                      </div>
                      <div className="font-medium truncate">{e.name}</div>
                      {e.venue && (
                        <div className="text-sm text-neutral-500 truncate">{e.venue}</div>
                      )}
                    </div>
                    <span className="text-neutral-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mt-14">
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
