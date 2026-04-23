"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/Button";
import type { Profile, Vip } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/utils";
import type { VipFormState } from "./actions";

function Field({
  label,
  children,
  span = 1,
}: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2;
}) {
  return (
    <label className={`flex flex-col gap-2 ${span === 2 ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] uppercase tracking-widest text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "h-10 border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:border-neutral-900";
const textareaCls =
  "min-h-24 border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900";

export default function VipForm({
  action,
  vip,
  hosts,
  submitLabel,
}: {
  action: (state: VipFormState, fd: FormData) => Promise<VipFormState>;
  vip?: Vip;
  hosts: Pick<Profile, "id" | "full_name" | "email">[];
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

      <Field label="Email">
        <input name="email" type="email" defaultValue={vip?.email ?? ""} className={inputCls} />
      </Field>

      <Field label="Phone">
        <input name="phone" defaultValue={vip?.phone ?? ""} className={inputCls} />
      </Field>

      <Field label="Country">
        <input name="country" defaultValue={vip?.country ?? ""} className={inputCls} />
      </Field>

      <Field label="Category">
        <select
          name="category"
          defaultValue={vip?.category ?? "other"}
          className={inputCls}
        >
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Dietary">
        <input name="dietary" defaultValue={vip?.dietary ?? ""} className={inputCls} placeholder="e.g. Vegetarian, Halal" />
      </Field>

      <Field label="Hotel">
        <input name="hotel" defaultValue={vip?.hotel ?? ""} className={inputCls} />
      </Field>

      <Field label="Flight arrival">
        <input name="flight_arrival" defaultValue={vip?.flight_arrival ?? ""} className={inputCls} placeholder="e.g. AI 102 arr 03 Feb 09:15" />
      </Field>

      <Field label="Flight departure">
        <input name="flight_departure" defaultValue={vip?.flight_departure ?? ""} className={inputCls} />
      </Field>

      <Field label="Assigned host" span={2}>
        <select
          name="assigned_host_id"
          defaultValue={vip?.assigned_host_id ?? ""}
          className={inputCls}
        >
          <option value="">— Unassigned —</option>
          {hosts.map((h) => (
            <option key={h.id} value={h.id}>
              {h.full_name ?? h.email}
            </option>
          ))}
        </select>
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
