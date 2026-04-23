"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/Button";
import type { Event } from "@/lib/types";
import type { EventFormState } from "./actions";

const inputCls =
  "h-10 border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:border-neutral-900";
const textareaCls =
  "min-h-24 border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900";

function Field({
  label,
  children,
  span = 1,
}: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2 | 3;
}) {
  return (
    <label
      className={`flex flex-col gap-2 ${
        span === 3 ? "sm:col-span-3" : span === 2 ? "sm:col-span-2" : ""
      }`}
    >
      <span className="text-[11px] uppercase tracking-widest text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

export default function EventForm({
  action,
  event,
  submitLabel,
}: {
  action: (state: EventFormState, fd: FormData) => Promise<EventFormState>;
  event?: Event;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<EventFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="grid sm:grid-cols-3 gap-5 max-w-3xl">
      <Field label="Event name" span={3}>
        <input name="name" defaultValue={event?.name ?? ""} className={inputCls} required />
      </Field>

      <Field label="Date">
        <input
          type="date"
          name="event_date"
          defaultValue={event?.event_date ?? ""}
          className={inputCls}
          required
        />
      </Field>
      <Field label="Start time">
        <input
          type="time"
          name="start_time"
          defaultValue={event?.start_time ?? ""}
          className={inputCls}
        />
      </Field>
      <Field label="End time">
        <input
          type="time"
          name="end_time"
          defaultValue={event?.end_time ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Venue" span={3}>
        <input name="venue" defaultValue={event?.venue ?? ""} className={inputCls} />
      </Field>

      <Field label="Dress code">
        <input name="dress_code" defaultValue={event?.dress_code ?? ""} className={inputCls} />
      </Field>
      <Field label="Capacity">
        <input
          type="number"
          min={0}
          name="capacity"
          defaultValue={event?.capacity ?? ""}
          className={inputCls}
        />
      </Field>
      <label className="flex items-center gap-2 self-end pb-2">
        <input
          type="checkbox"
          name="invite_only"
          defaultChecked={event?.invite_only ?? true}
          className="w-4 h-4"
        />
        <span className="text-sm">Invite-only</span>
      </label>

      <Field label="Notes" span={3}>
        <textarea name="notes" defaultValue={event?.notes ?? ""} className={textareaCls} />
      </Field>

      {state?.error && (
        <p className="sm:col-span-3 text-sm text-rose-700">{state.error}</p>
      )}

      <div className="sm:col-span-3 flex items-center gap-3 pt-4 border-t border-neutral-200">
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
