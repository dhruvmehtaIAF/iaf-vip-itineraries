import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import { CATEGORY_LABELS } from "@/lib/utils";
import { isAdmin } from "@/lib/auth";
import VipsFilterBar from "./VipsFilterBar";

type SearchParams = {
  q?: string;
  category?: string;
  country?: string;
};

export default async function VipsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const admin = await isAdmin();

  let query = supabase
    .from("vips")
    .select("id, full_name, email, country, category, hotel, assigned_host:profiles(full_name)")
    .order("full_name");

  if (params.q) query = query.ilike("full_name", `%${params.q}%`);
  if (params.category) query = query.eq("category", params.category);
  if (params.country) query = query.eq("country", params.country);

  const { data: vips } = await query;
  const rows = vips ?? [];

  const { data: countriesData } = await supabase.from("vips").select("country").not("country", "is", null);
  const countries = Array.from(new Set((countriesData ?? []).map((r) => r.country).filter(Boolean))).sort() as string[];

  return (
    <>
      <PageHeader
        eyebrow={`${rows.length} ${rows.length === 1 ? "VIP" : "VIPs"}`}
        title="VIPs"
        subtitle="The full roster for IAF 2027. Click any VIP to view their itinerary."
        actions={
          admin && (
            <LinkButton href="/vips/new" variant="primary">
              + Add VIP
            </LinkButton>
          )
        }
      />

      <VipsFilterBar countries={countries} />

      <div className="border border-neutral-200 overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Hotel</th>
              <th className="px-4 py-3 font-medium">Host</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No VIPs match your filters.
                </td>
              </tr>
            ) : (
              rows.map((v) => {
                const host = Array.isArray(v.assigned_host)
                  ? v.assigned_host[0]
                  : (v.assigned_host as { full_name: string | null } | null);
                return (
                  <tr key={v.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link href={`/vips/${v.id}`} className="font-medium hover:underline">
                        {v.full_name}
                      </Link>
                      {v.email && (
                        <div className="text-xs text-neutral-500">{v.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {CATEGORY_LABELS[v.category] ?? v.category}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{v.country ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-700">{v.hotel ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-700">{host?.full_name ?? "—"}</td>
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
