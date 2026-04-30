import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import {
  VIP_CATEGORY_LABELS,
  VIP_COUNTRY_LABELS,
  VIP_TYPE_LABELS,
  formatAddedYear,
} from "@/lib/utils";
import { isAdmin } from "@/lib/auth";
import VipsFilterBar from "./VipsFilterBar";
import type { VipCategory, VipCountry, VipType } from "@/lib/types";

type SearchParams = {
  q?: string;
  type?: string;
  category?: string;
  country?: string;
  added_year?: string;
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
    .select("id, full_name, designation, email, country, type, category, added_year, hotel")
    .order("full_name");

  if (params.q) query = query.ilike("full_name", `%${params.q}%`);
  if (params.type) query = query.eq("type", params.type);
  if (params.category) query = query.eq("category", params.category);
  if (params.country) query = query.eq("country", params.country);
  if (params.added_year) query = query.eq("added_year", Number(params.added_year));

  const { data: vips } = await query;
  const rows = (vips ?? []) as Array<{
    id: string;
    full_name: string;
    designation: string | null;
    email: string | null;
    country: VipCountry | null;
    type: VipType;
    category: VipCategory;
    added_year: number | null;
    hotel: string | null;
  }>;

  // Available years for the filter dropdown
  const { data: yearsData } = await supabase
    .from("vips")
    .select("added_year")
    .not("added_year", "is", null);
  const years = Array.from(
    new Set((yearsData ?? []).map((r) => r.added_year).filter(Boolean) as number[])
  ).sort((a, b) => b - a);

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

      <VipsFilterBar years={years} />

      <div className="border border-neutral-200 overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 font-medium">Hotel</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  No VIPs match your filters.
                </td>
              </tr>
            ) : (
              rows.map((v) => (
                <tr key={v.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/vips/${v.id}`} className="font-medium hover:underline">
                      {v.full_name}
                    </Link>
                    {v.designation && (
                      <div className="text-xs text-neutral-500">{v.designation}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {VIP_TYPE_LABELS[v.type] ?? v.type}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {VIP_CATEGORY_LABELS[v.category] ?? v.category}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {v.country ? VIP_COUNTRY_LABELS[v.country] : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700 tabular-nums">
                    {v.added_year ? formatAddedYear(v.added_year) : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{v.hotel ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
