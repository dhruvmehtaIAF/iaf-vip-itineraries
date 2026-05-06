"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/Button";
import type { Vip } from "@/lib/types";
import {
  VIP_CATEGORY_LABELS,
  VIP_COUNTRY_LABELS,
  VIP_TYPE_LABELS,
} from "@/lib/utils";
import type { VipFormState } from "./actions";

function Field({
  label,
  hint,
  children,
  span = 1,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <label className={`flex flex-col gap-2 ${span === 2 ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] uppercase tracking-widest text-neutral-500">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal text-neutral-400">— {hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "h-10 border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:border-neutral-900";
const textareaCls =
  "min-h-24 border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900";

const CURRENT_YEAR = new Date().getFullYear();
const ADDED_YEARS: number[] = Array.from(
  { length: CURRENT_YEAR + 1 - 2010 + 1 },
  (_, i) => CURRENT_YEAR + 1 - i
);

export default function VipForm({
  action,
  vip,
  submitLabel,
}: {
  action: (state: VipFormState, fd: FormData) => Promise<VipFormState>;
  vip?: Vip;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<VipFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="grid sm:grid-cols-2 gap-5 max-w-3xl">
      <Field label="Full name" span={2}>
        <input
          name="full_name"
          defaultValue={vip?.full_name ?? ""}
          className={inputCls}
          required
        />
      </Field>

      <Field label="Designation" hint="Title / role" span={2}>
        <input
          name="designation"
          defaultValue={vip?.designation ?? ""}
          className={inputCls}
          placeholder="e.g. Founder, KNMA"
        />
      </Field>

      <Field label="Email">
        <input name="email" type="email" defaultValue={vip?.email ?? ""} className={inputCls} />
      </Field>

      <Field label="Phone">
        <input name="phone" defaultValue={vip?.phone ?? ""} className={inputCls} />
      </Field>

      <Field label="Country">
        <select
          name="country"
          defaultValue={vip?.country ?? ""}
          className={inputCls}
        >
          <option value="">— Select —</option>
          {Object.entries(VIP_COUNTRY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Added in" hint="IAF year">
        <select
          name="added_year"
          defaultValue={vip?.added_year ?? ""}
          className={inputCls}
        >
          <option value="">— Select —</option>
          {ADDED_YEARS.map((y) => (
            <option key={y} value={y}>
              IAF {y}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Type" hint="Profession">
        <select
          name="type"
          defaultValue={vip?.type ?? "other"}
          className={inputCls}
        >
          {Object.entries(VIP_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Category" hint="IAF tier">
        <select
          name="category"
          defaultValue={vip?.category ?? "level_4"}
          className={inputCls}
        >
          {Object.entries(VIP_CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>

      <label className="flex items-start gap-3 sm:col-span-2 border border-neutral-200 px-4 py-3 cursor-pointer hover:border-neutral-400">
        <input
          type="checkbox"
          name="one_time"
          defaultChecked={vip?.one_time ?? false}
          className="w-4 h-4 mt-0.5"
        />
        <span>
          <span className="block text-sm font-medium">One-time VIP</span>
          <span className="block text-xs text-neutral-500 mt-0.5">
            Tick if this VIP is only being added for a specific year and not part of the ongoing roster.
          </span>
        </span>
      </label>

      <Field label="Hotel" span={2}>
        <input name="hotel" defaultValue={vip?.hotel ?? ""} className={inputCls} />
      </Field>

      <Field label="Arrival date">
        <input
          type="date"
          name="arrival_date"
          defaultValue={vip?.arrival_date ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Arrival time" hint="optional">
        <input
          type="time"
          name="arrival_time"
          defaultValue={vip?.arrival_time ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Departure date">
        <input
          type="date"
          name="departure_date"
          defaultValue={vip?.departure_date ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Departure time" hint="optional">
        <input
          type="time"
          name="departure_time"
          defaultValue={vip?.departure_time ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Notes" span={2}>
        <textarea name="notes" defaultValue={vip?.notes ?? ""} className={textareaCls} />
      </Field>

      {state?.error && (
        <p className="sm:col-span-2 text-sm text-rose-700">{state.error}</p>
      )}

      <div className="sm:col-span-2 flex items-center gap-3 pt-4 border-t border-neutral-200">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
