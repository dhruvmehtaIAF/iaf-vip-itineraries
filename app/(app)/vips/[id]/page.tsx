import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import {
  VIP_CATEGORY_LABELS,
  VIP_COUNTRY_LABELS,
  VIP_TYPE_LABELS,
  formatAddedYear,
  formatDate,
  formatDateTime,
  formatTimeRange,
} from "@/lib/utils";
import type { RsvpStatus, Vip } from "@/lib/types";
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

  const [{ data: vipRaw }, { data: companions }, { data: invitations }, { data: allEvents }] =
    await Promise.all([
      supabase.from("vips").select("*").eq("id", id).single(),
      supabase.from("companions").select("*").eq("vip_id", id).order("created_at"),
      supabase
        .from("invitations")
        .select("id, status, companions_attending, list_number, notes, event:events(id,name,event_date,start_time,end_time,venue,dress_code)")
        .eq("vip_id", id),
      supabase.from("events").select("id, name, event_date").order("event_date"),
    ]);

  if (!vipRaw) notFound();
  const vip = vipRaw as Vip;

  type InvRow = {
    id: string;
    status: RsvpStatus;
    companions_attending: number;
    list_number: number;
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
    .sort((a, b) =>
      (a.event!.event_date + (a.event!.start_time ?? "")).localeCompare(
        b.event!.event_date + (b.event!.start_time ?? "")
      )
    );

  const subtitle = [
    vip.designation,
    vip.country ? VIP_COUNTRY_LABELS[vip.country as keyof typeof VIP_COUNTRY_LABELS] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader
        back={{ href: "/vips", label: "All VIPs" }}
        eyebrow={`${VIP_TYPE_LABELS[vip.type] ?? vip.type} · ${VIP_CATEGORY_LABELS[vip.category] ?? vip.category}`}
        title={vip.full_name}
        subtitle={subtitle}
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
          <Card title="Profile">
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <Row label="Designation" value={vip.designation} colSpan />
              <Row label="Type" value={VIP_TYPE_LABELS[vip.type] ?? vip.type} colSpan />
              <Row label="Category" value={VIP_CATEGORY_LABELS[vip.category] ?? vip.category} colSpan />
              <Row label="Added" value={vip.added_year ? formatAddedYear(vip.added_year) : null} colSpan />
            </dl>
          </Card>

          <Card title="Contact">
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <Row label="Email" value={vip.email} colSpan />
              <Row label="Phone" value={vip.phone} colSpan />
              <Row
                label="Country"
                value={
                  vip.country
                    ? VIP_COUNTRY_LABELS[vip.country as keyof typeof VIP_COUNTRY_LABELS]
                    : null
                }
                colSpan
              />
            </dl>
          </Card>

          <Card title="Travel">
            <dl className="grid grid-cols-3 gap-y-3 text-sm">
              <Row label="Hotel" value={vip.hotel} colSpan />
              <Row
                label="Arrival"
                value={
                  vip.arrival_date
                    ? formatDateTime(vip.arrival_date, vip.arrival_time)
                    : null
                }
                colSpan
              />
              <Row
                label="Departure"
                value={
                  vip.departure_date
                    ? formatDateTime(vip.departure_date, vip.departure_time)
                    : null
                }
                colSpan
              />
            </dl>
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

function Row({
  label,
  value,
  colSpan,
}: {
  label: string;
  value: string | null;
  colSpan?: boolean;
}) {
  return (
    <>
      <dt className="col-span-1 text-neutral-500 text-xs pt-0.5">{label}</dt>
      <dd className={`${colSpan ? "col-span-2" : ""} text-neutral-900`}>
        {value ? value : <span className="text-neutral-400">—</span>}
      </dd>
    </>
  );
}
