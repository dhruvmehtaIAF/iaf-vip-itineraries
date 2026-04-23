import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { CATEGORY_LABELS, formatDate, formatTimeRange, RSVP_LABELS } from "@/lib/utils";
import type { RsvpStatus, VipCategory } from "@/lib/types";
import EventGuestList from "./EventGuestList";
import DeleteEventButton from "./DeleteEventButton";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await isAdmin();

  const [{ data: event }, { data: invitations }, { data: allVips }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase
      .from("invitations")
      .select("id, status, companions_attending, notes, vip:vips(id,full_name,country,category,dietary)")
      .eq("event_id", id),
    supabase.from("vips").select("id, full_name, country, category").order("full_name"),
  ]);

  if (!event) notFound();

  type Row = {
    id: string;
    status: RsvpStatus;
    companions_attending: number;
    notes: string | null;
    vip: {
      id: string;
      full_name: string;
      country: string | null;
      category: VipCategory;
      dietary: string | null;
    } | null;
  };
  const rows = (invitations ?? []) as unknown as Row[];

  const counts: Record<string, number> = {
    accepted: 0, invited: 0, tentative: 0, declined: 0, waitlist: 0, not_sent: 0,
  };
  let companionTotal = 0;
  for (const r of rows) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
    if (r.status === "accepted") companionTotal += r.companions_attending ?? 0;
  }
  const confirmedHeads = counts.accepted + companionTotal;

  return (
    <>
      <PageHeader
        back={{ href: "/events", label: "All events" }}
        eyebrow={`${formatDate(event.event_date)} · ${formatTimeRange(event.start_time, event.end_time) || "All day"}`}
        title={event.name}
        subtitle={[event.venue, event.dress_code && `Dress: ${event.dress_code}`].filter(Boolean).join(" · ")}
        actions={
          <div className="flex items-center gap-2">
            <LinkButton href={`/events/${event.id}/guests/csv`} variant="secondary">
              Export CSV
            </LinkButton>
            {admin && (
              <LinkButton href={`/events/${event.id}/edit`} variant="ghost">
                Edit
              </LinkButton>
            )}
          </div>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200 mb-10">
        <Stat label="Confirmed heads" value={confirmedHeads} />
        <Stat label="Tentative" value={counts.tentative} />
        <Stat label="Invited" value={counts.invited} />
        <Stat label="Capacity" value={event.capacity ?? "—"} />
      </section>

      {event.notes && (
        <div className="border-l-4 border-neutral-900 pl-4 mb-10">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2">Event notes</h3>
          <p className="text-sm whitespace-pre-wrap">{event.notes}</p>
        </div>
      )}

      <section className="mb-10">
        <h2 className="iaf-display text-3xl mb-6">RSVP Summary</h2>
        <div className="flex flex-wrap gap-2">
          {(["accepted", "tentative", "invited", "waitlist", "declined", "not_sent"] as RsvpStatus[]).map(
            (s) => (
              <div key={s} className="border border-neutral-200 px-3 py-2 flex items-center gap-3">
                <StatusBadge status={s} />
                <span className="text-lg font-bold tabular-nums">{counts[s] ?? 0}</span>
              </div>
            )
          )}
        </div>
      </section>

      <EventGuestList
        eventId={event.id}
        rows={rows.map((r) => ({
          ...r,
          status_label: RSVP_LABELS[r.status],
          category_label: r.vip ? CATEGORY_LABELS[r.vip.category] : "",
        }))}
        allVips={allVips ?? []}
        admin={admin}
      />

      {admin && (
        <div className="mt-10 pt-6 border-t border-neutral-200">
          <DeleteEventButton id={event.id} name={event.name} />
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white px-5 py-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-3">{label}</div>
      <div className="iaf-display text-4xl tabular-nums">{value}</div>
    </div>
  );
}
