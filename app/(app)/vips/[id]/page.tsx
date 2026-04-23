import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { CATEGORY_LABELS, formatDate, formatTimeRange } from "@/lib/utils";
import type { RsvpStatus } from "@/lib/types";
import CompanionsSection from "./CompanionsSection";
import InvitationsSection from "./InvitationsSection";
import DeleteVipButton from "./DeleteVipButton";

export default async function VipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = await isAdmin();

  const [{ data: vip }, { data: host }, { data: companions }, { data: invitations }, { data: allEvents }] =
    await Promise.all([
      supabase.from("vips").select("*").eq("id", id).single(),
      // host fetched separately to avoid complex typing on the nested select
      Promise.resolve({ data: null }),
      supabase.from("companions").select("*").eq("vip_id", id).order("created_at"),
      supabase
        .from("invitations")
        .select("id, status, companions_attending, notes, event:events(id,name,event_date,start_time,end_time,venue,dress_code)")
        .eq("vip_id", id),
      supabase.from("events").select("id, name, event_date").order("event_date"),
    ]);

  void host;

  if (!vip) notFound();

  const { data: hostData } = vip.assigned_host_id
    ? await supabase.from("profiles").select("full_name, email").eq("id", vip.assigned_host_id).single()
    : { data: null };

  type InvRow = {
    id: string;
    status: RsvpStatus;
    companions_attending: number;
    notes: string | null;
    event: {
      id: string;
      name: string;
      event_date: string;
      start_time: string | null;
      end_time: string | null;
      venue: string | null;
      dress_code: string | null;
    } | null;
  };

  const invitationsTyped = (invitations ?? []) as unknown as InvRow[];

  const accepted = invitationsTyped
    .filter((i) => i.status === "accepted" && i.event)
    .sort((a, b) => (a.event!.event_date + (a.event!.start_time ?? "")).localeCompare(b.event!.event_date + (b.event!.start_time ?? "")));

  return (
    <>
      <PageHeader
        back={{ href: "/vips", label: "All VIPs" }}
        eyebrow={CATEGORY_LABELS[vip.category] ?? vip.category}
        title={vip.full_name}
        subtitle={[vip.country, vip.email].filter(Boolean).join(" · ")}
        actions={
          <div className="flex items-center gap-2">
            <LinkButton href={`/vips/${vip.id}/itinerary/pdf`} variant="secondary">
              Download PDF
            </LinkButton>
            {admin && (
              <LinkButton href={`/vips/${vip.id}/edit`} variant="ghost">
                Edit
              </LinkButton>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-10">
        <section className="lg:col-span-1 space-y-8">
          <Card title="Contact">
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <Row label="Email" value={vip.email} colSpan />
              <Row label="Phone" value={vip.phone} colSpan />
              <Row label="Country" value={vip.country} colSpan />
              <Row label="Dietary" value={vip.dietary} colSpan />
            </dl>
          </Card>

          <Card title="Travel">
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <Row label="Hotel" value={vip.hotel} colSpan />
              <Row label="Arrival" value={vip.flight_arrival} colSpan />
              <Row label="Departure" value={vip.flight_departure} colSpan />
            </dl>
          </Card>

          <Card title="Assigned Host">
            <p className="text-sm">
              {hostData ? (
                <>
                  <span className="font-medium">{hostData.full_name ?? "—"}</span>
                  <br />
                  <span className="text-neutral-500">{hostData.email}</span>
                </>
              ) : (
                <span className="text-neutral-400">Unassigned</span>
              )}
            </p>
          </Card>

          {vip.notes && (
            <Card title="Notes">
              <p className="text-sm whitespace-pre-wrap text-neutral-700">{vip.notes}</p>
            </Card>
          )}

          <CompanionsSection vipId={vip.id} companions={companions ?? []} admin={admin} />

          {admin && (
            <div className="pt-4 border-t border-neutral-200">
              <DeleteVipButton id={vip.id} name={vip.full_name} />
            </div>
          )}
        </section>

        <section className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="iaf-display text-3xl mb-6">Itinerary — Confirmed</h2>
            {accepted.length === 0 ? (
              <p className="text-neutral-500 text-sm border border-dashed border-neutral-300 px-4 py-8 text-center">
                No confirmed events yet.
              </p>
            ) : (
              <ol className="border border-neutral-200">
                {accepted.map((i) => (
                  <li key={i.id} className="border-b border-neutral-200 last:border-b-0 p-4 flex items-start gap-4">
                    <div className="w-28 shrink-0">
                      <div className="text-[11px] uppercase tracking-widest text-neutral-500">
                        {formatDate(i.event!.event_date)}
                      </div>
                      <div className="font-semibold tabular-nums text-neutral-900 mt-1">
                        {formatTimeRange(i.event!.start_time, i.event!.end_time) || "All day"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/events/${i.event!.id}`} className="font-medium hover:underline">
                        {i.event!.name}
                      </Link>
                      {i.event!.venue && (
                        <div className="text-sm text-neutral-500">{i.event!.venue}</div>
                      )}
                      {(i.event!.dress_code || i.companions_attending > 0) && (
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-500">
                          {i.event!.dress_code && <span>Dress: {i.event!.dress_code}</span>}
                          {i.companions_attending > 0 && (
                            <span>+{i.companions_attending} companion(s)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <InvitationsSection
            vipId={vip.id}
            invitations={invitationsTyped}
            allEvents={allEvents ?? []}
            admin={admin}
          />
        </section>
      </div>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-neutral-200 p-5">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, colSpan }: { label: string; value: string | null; colSpan?: boolean }) {
  return (
    <>
      <dt className="col-span-1 text-neutral-500 text-xs pt-0.5">{label}</dt>
      <dd className={`${colSpan ? "col-span-2" : ""} text-neutral-900`}>
        {value ? value : <span className="text-neutral-400">—</span>}
      </dd>
    </>
  );
}
