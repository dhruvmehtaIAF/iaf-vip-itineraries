"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  VIP_CATEGORY_LABELS,
  VIP_COUNTRY_LABELS,
  VIP_TYPE_LABELS,
} from "@/lib/utils";

export default function VipsFilterBar({ years }: { years: number[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`/vips?${params.toString()}`));
  }

  const hasFilters =
    searchParams.get("q") ||
    searchParams.get("type") ||
    searchParams.get("category") ||
    searchParams.get("country") ||
    searchParams.get("added_year");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateParam("q", q);
      }}
      className="mb-6 flex flex-wrap items-center gap-3"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name…"
        className="h-10 border border-neutral-200 px-3 text-sm w-64 focus:outline-none focus:border-neutral-900"
      />

      <select
        value={searchParams.get("type") ?? ""}
        onChange={(e) => updateParam("type", e.target.value)}
        className="h-10 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
      >
        <option value="">All types</option>
        {Object.entries(VIP_TYPE_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="h-10 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
      >
        <option value="">All categories</option>
        {Object.entries(VIP_CATEGORY_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("country") ?? ""}
        onChange={(e) => updateParam("country", e.target.value)}
        className="h-10 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
      >
        <option value="">All countries</option>
        {Object.entries(VIP_COUNTRY_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>

      {years.length > 0 && (
        <select
          value={searchParams.get("added_year") ?? ""}
          onChange={(e) => updateParam("added_year", e.target.value)}
          className="h-10 border border-neutral-200 px-2 text-sm focus:outline-none focus:border-neutral-900"
        >
          <option value="">Any year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              IAF {y}
            </option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            startTransition(() => router.replace("/vips"));
          }}
          className="text-sm text-neutral-500 hover:text-neutral-900 underline"
        >
          Clear
        </button>
      )}

      {isPending && <span className="text-xs text-neutral-400">…</span>}
    </form>
  );
}
